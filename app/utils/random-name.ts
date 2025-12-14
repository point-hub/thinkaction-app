export default async function () {
  const { data: adjectives } = await import('~/assets/data/name-generator/adjectives.json');
  const { data: nouns } = await import('~/assets/data/name-generator/nouns.json');

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return {
    username: `${randomAdjective?.toLowerCase()}.${randomNoun?.toLowerCase()}`,
    fullname: `${randomAdjective} ${randomNoun}`,
  };
}
