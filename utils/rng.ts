export const rng = {
  // Get random float between min and max
  float: (min: number, max: number) => Math.random() * (max - min) + min,
  
  // Get random integer
  int: (min: number, max: number) => Math.floor(Math.random() * (max - min) + min),
  
  // Get random item from array
  pick: <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)],
  
  // True/False with probability (0-1)
  bool: (chance: number = 0.5) => Math.random() < chance,

  shuffle: <T>(array: T[]): T[] => {
      let currentIndex = array.length;
      let randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex !== 0) {
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
              array[randomIndex], array[currentIndex]];
      }

      return array;
  }

};
