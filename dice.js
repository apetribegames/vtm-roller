export function d10() {
  return Math.floor(Math.random() * 10) + 1;
}

export function rollDice({ pool, difficulty, willpower }, roll = d10) {
  const dice = [];
  let successes = 0;
  let hasOne = false;

  for (let i = 0; i < pool; i++) {
    const chain = [roll()];
    while (chain[chain.length - 1] === 10) {
      chain.push(roll());
    }
    if (chain[0] === 1) {
      hasOne = true;
    }
    successes += chain.filter(v => v >= difficulty).length;
    dice.push(chain);
  }

  if (willpower) {
    successes += 1;
  }
  if (hasOne) {
    successes -= 1;
  }

  const outcome = successes > 0 ? "success" : successes === 0 ? "failure" : "botch";
  return { dice, successes, outcome };
}
