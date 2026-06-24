import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface AIBodyTrackerProps {
  mode: 'PUSHUPS' | 'PULLUPS' | 'SQUATS';
  onRepDetected: (exercise: string) => void;
}

export const AIBodyTracker = ({ mode, onRepDetected }: AIBodyTrackerProps) => {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'REP') {
        onRepDetected(data.exercise);
      }
    } catch (e) {
      console.error('Failed to parse message from AI engine', e);
    }
  };

  useEffect(() => {
    // Sync mode with the WebView
    if (webViewRef.current) {
      const script = `window.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ type: 'SET_MODE', mode: '${mode}' }) }));`;
      webViewRef.current.injectJavaScript(script);
    }
  }, [mode]);

  const htmlSource = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
  <style>
    body { margin: 0; padding: 0; background: black; overflow: hidden; display: flex; justify-content: center; align-items: center; }
    canvas { width: 100vw; height: 100vh; object-fit: cover; }
    #video { display: none; }
  </style>
</head>
<body>
  <video id="video" playsinline></video>
  <canvas id="canvas"></canvas>

  <script>
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let mode = '${mode}';
    let count = 0;
    let stage = 'UP';

    const sendRep = () => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'REP', exercise: mode }));
      }
    };

    function onResults(results) {
      if (!results.poseLandmarks) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      // Neon Skeleton Styling with Glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00F0FF';
      drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00F0FF', lineWidth: 4 });
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FF0055';
      drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0055', lineWidth: 2, radius: 5 });
      
      ctx.shadowBlur = 0; // Reset for performance
      ctx.restore();

      const landmarks = results.poseLandmarks;
      if (mode === 'PUSHUPS') detectPushup(landmarks);
      else if (mode === 'PULLUPS') detectPullup(landmarks);
      else if (mode === 'SQUATS') detectSquat(landmarks);
    }

    function calculateAngle(a, b, c) {
      const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
      let angle = Math.abs(radians * 180.0 / Math.PI);
      if (angle > 180.0) angle = 360 - angle;
      return angle;
    }

    function detectPushup(lm) {
      const leftShoulder = lm[11];
      const leftElbow = lm[13];
      const leftWrist = lm[15];
      const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      if (angle < 90) stage = 'DOWN';
      if (angle > 160 && stage === 'DOWN') {
        stage = 'UP';
        sendRep();
      }
    }

    function detectSquat(lm) {
      const leftHip = lm[23];
      const leftKnee = lm[25];
      const leftAnkle = lm[27];
      const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
      if (angle < 100) stage = 'DOWN';
      if (angle > 160 && stage === 'DOWN') {
        stage = 'UP';
        sendRep();
      }
    }

    function detectPullup(lm) {
      const nose = lm[0];
      const leftWrist = lm[15];
      const rightWrist = lm[16];
      const barHeight = (leftWrist.y + rightWrist.y) / 2;
      if (nose.y > barHeight + 0.1) stage = 'DOWN';
      if (nose.y < barHeight && stage === 'DOWN') {
        stage = 'UP';
        sendRep();
      }
    }

    const pose = new Pose({
      locateFile: (file) => \`https://cdn.jsdelivr.net/npm/@mediapipe/pose/\${file}\`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults(onResults);

    const camera = new Camera(video, {
      onFrame: async () => {
        await pose.send({ image: video });
      },
      width: 640,
      height: 480
    });

    camera.start();

    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SET_MODE') {
          mode = data.mode;
          stage = 'UP';
        }
      } catch (e) {}
    });
  </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlSource }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={handleMessage}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
