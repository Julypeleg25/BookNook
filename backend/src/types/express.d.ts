declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        // add other user properties if needed
      };
    }
  }
}

export {};
