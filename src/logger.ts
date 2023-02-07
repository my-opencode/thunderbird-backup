export function setLogger(){
  global.logger = function(...a:(string|number|string[])[]){
    if (!process.argv.includes(`--silent`)) {
      console.log(...a);
    }
  };
}