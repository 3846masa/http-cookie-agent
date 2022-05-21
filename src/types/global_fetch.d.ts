declare global {
  interface RequestInit {
    dispatcher?: import('undici').Agent;
  }
}

export {};
