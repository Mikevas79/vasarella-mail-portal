declare module 'unix-crypt-td-js' {
  export default function crypt(password: string, salt: string): string;
}
