// PROBLEM

/**
 * You work for the DMV; you have a specific, sequential way of generating new license plate numbers:
 *
 * Each license plate number has 6 alphanumeric characters. The numbers always come before the letters.
 *
 * The first plate number is 000000, followed by 000001...
 * When you arrive at 999999, the next entry would be 00000A, Followed by 00001A...
 * When you arrive at 99999A, the next entry is 00000B, Followed by 00001B...
 * After following the pattern to 99999Z, the next in the sequence would be 0000AA...
 *
 * When 9999AA is reached, the next in the series would be 0000AB...0001AB
 * When 9999AB is reached, the next in the series would be 0000AC...0001AC
 * When 9999AZ is reached, the next in the series would be 0000BA...0001BA
 * When 9999ZZ is reached, the next in the series would be 000AAA...001AAA
 *
 * And so on untill the sequence completes with ZZZZZZ.
 *
 * So the pattern overview looks a bit like this:
 *
 * 000000
 * 000001
 * ...
 * 999999
 * 00000A
 * 00001A
 * ...
 * 99999A
 * 00000B
 * 00001B
 * ...
 * 99999Z
 * 0000AA
 * 0001AA
 * ...
 * 9999AA
 * 0000AB
 * 0001AB
 * ...
 * 9999AB
 * 0000AC
 * 0001AC
 * ...
 * 9999AZ
 * 0000BA
 * 0001BA
 * ...
 * 9999BZ
 * 0000CA
 * 0001CA
 * ...
 * 9999ZZ
 * 000AAA
 * 001AAA
 * ...
 * 999AAA
 * 000AAB
 * 001AAB
 * ...
 * 999AAZ
 * 000ABA
 * ...
 * ZZZZZZ
 *
 *
 * The goal is to write the most efficient function that can return the nth element in this sequence.
 * */

// IMPLEMENTATION

function getNthPlate(n) {
  if (n < 0) throw new Error("n must be non-negative number");

  const PLATE_LENGTH = 6;

  // We'll split possible plate numbers into 7 blocks based on the amount of letters and numbers
  //  ###### (0 letters, numbers only)
  //  #####L (1 letter)
  //  ...
  //  #LLLLL (5 letters)
  //  LLLLLL (6 letters)

  // Create arrays of possible combinations where the index is the amount of numbers or letters
  const combinationsByNumbersAmount = Array.from(
    { length: PLATE_LENGTH + 1 },
    (_, i) => Math.pow(10, i)
  );
  const combinationsByLettersAmount = Array.from(
    { length: PLATE_LENGTH + 1 },
    (_, i) => Math.pow(26, i)
  );

  // Create an array of plates contained in each block where the index is the block number
  const blockSizes = Array.from({ length: PLATE_LENGTH + 1 }, (_, i) => {
    return (
      combinationsByNumbersAmount[PLATE_LENGTH - i] *
      combinationsByLettersAmount[i]
    );
  });

  const lettersCount = getLettersCount(n, blockSizes);

  if (lettersCount > blockSizes.length - 1) {
    throw new Error("n is out of range");
  }

  const numbersCount = PLATE_LENGTH - lettersCount;

  // Create a prefix sum array of block sizes to understand the start index of each block
  const blockSizesPrefixSumArray = createPrefixSumArray(blockSizes);

  const offset = n - blockSizesPrefixSumArray[lettersCount];

  // Get numbers and letters indexes within the block based on the offset
  const numbersIndex = offset % combinationsByNumbersAmount[numbersCount];
  const lettersIndex = Math.floor(
    offset / combinationsByNumbersAmount[numbersCount]
  );

  // If numbersIndex is 0, we don't need to create a prefix
  const numbersPrefix =
    numbersCount > 0 ? numbersIndex.toString().padStart(numbersCount, "0") : "";
  const lettersPostfix = getLettersPostfixFromLetterIndex(
    lettersIndex,
    lettersCount
  );

  return numbersPrefix + lettersPostfix;
}

function getLettersCount(n, blockBoundaries) {
  let lettersCount = 0;

  while (n >= blockBoundaries[lettersCount]) {
    n -= blockBoundaries[lettersCount];
    lettersCount++;
  }

  return lettersCount;
}

function createPrefixSumArray(arr) {
  let sum = 0;
  return arr.map((_, index) => {
    return (sum += arr[index - 1] ?? 0);
  });
}

// Used to convert a number to a base-26 letter string
function getLettersPostfixFromLetterIndex(index, lettersCount) {
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  let value = index;

  for (let i = 0; i < lettersCount; i++) {
    const reminder = value % ALPHABET.length;
    result = ALPHABET[reminder] + result;
    value = Math.floor(value / ALPHABET.length);
  }

  return result;
}

function runSanityTests() {
  const assert = require("assert");

  const PLATE_LENGTH = 6;

  const combinationsByNumbersAmount = Array.from(
    { length: PLATE_LENGTH + 1 },
    (_, i) => Math.pow(10, i)
  );
  const combinationsByLettersAmount = Array.from(
    { length: PLATE_LENGTH + 1 },
    (_, i) => Math.pow(26, i)
  );
  const blockSizes = Array.from({ length: PLATE_LENGTH + 1 }, (_, i) => {
    return (
      combinationsByNumbersAmount[PLATE_LENGTH - i] *
      combinationsByLettersAmount[i]
    );
  });
  const blockSizesPrefixSumArray = createPrefixSumArray(blockSizes);

  const MAX_INDEX = blockSizesPrefixSumArray[6] + blockSizes[6] - 1;

  assert.throws(() => getNthPlate(-1));
  assert.throws(() => getNthPlate(MAX_INDEX + 1));

  assert.strictEqual(getNthPlate(blockSizesPrefixSumArray[0]), "000000");
  assert.strictEqual(getNthPlate(blockSizesPrefixSumArray[1] - 1), "999999");
  assert.strictEqual(getNthPlate(blockSizesPrefixSumArray[1]), "00000A");
  assert.strictEqual(getNthPlate(blockSizesPrefixSumArray[3] - 1), "9999ZZ");
  assert.strictEqual(getNthPlate(blockSizesPrefixSumArray[3] - 8), "9992ZZ");
  assert.strictEqual(getNthPlate(blockSizesPrefixSumArray[3]), "000AAA");
  assert.strictEqual(getNthPlate(MAX_INDEX), "ZZZZZZ");
}

// runSanityTests();
