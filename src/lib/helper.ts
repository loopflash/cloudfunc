export function isClass(func : any){
    // Class constructor is also a function
    if(!(func && func.constructor === Function) || func.prototype === undefined)
      return false;
    
    // This is a class that extends other class
    if(Function.prototype !== Object.getPrototypeOf(func))
      return true;
    
    // Usually a function will only have 'constructor' in the prototype
    return Object.getOwnPropertyNames(func.prototype).length > 1;
}
  