const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function randomBlock(length:number){let value="";for(let index=0;index<length;index++)value+=ALPHABET[Math.floor(Math.random()*ALPHABET.length)];return value}
export function generateTrackingCode(){return `PIU-${new Date().getFullYear()}-${randomBlock(4)}`}
