import type { Request, Response } from 'express';
export declare const signup: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const supabaseLogin: (req: Request, res: Response) => Promise<void>;
export declare const firebaseLogin: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map