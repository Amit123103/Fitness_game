import { create } from 'zustand';
import io, { Socket } from 'socket.io-client';

interface MultiplayerState {
  socket: Socket | null;
  roomId: string | null;
  opponentHealth: number;
  opponentReps: number;
  duelStatus: 'IDLE' | 'WAITING' | 'ACTIVE' | 'FINISHED';
  
  connect: (url: string) => void;
  createDuel: () => void;
  joinDuel: (id: string) => void;
  syncFitness: (reps: number, health: number) => void;
  attackOpponent: (damage: number) => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  socket: null,
  roomId: null,
  opponentHealth: 100,
  opponentReps: 0,
  duelStatus: 'IDLE',

  connect: (url) => {
    const socket = io(url);

    socket.on('duel_created', ({ roomId }) => {
      set({ roomId, duelStatus: 'WAITING' });
    });

    socket.on('duel_started', ({ roomId }) => {
      set({ duelStatus: 'ACTIVE', roomId });
    });

    socket.on('opponent_sync', ({ reps, health }) => {
      set({ opponentReps: reps, opponentHealth: health });
    });

    socket.on('received_damage', ({ damage }) => {
      // Logic to handle damage received from opponent
      // This would normally interact with useUserStore
    });

    set({ socket });
  },

  createDuel: () => {
    get().socket?.emit('create_duel');
  },

  joinDuel: (id) => {
    get().socket?.emit('join_duel', id);
  },

  syncFitness: (reps, health) => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('sync_fitness', { roomId, reps, health });
    }
  },

  attackOpponent: (damage) => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('attack_player', { roomId, damage });
    }
  },
}));
