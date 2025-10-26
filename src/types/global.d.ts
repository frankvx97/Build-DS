declare module '*.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.scss?raw' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}
