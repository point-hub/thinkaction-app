export interface Token {
  text: string;
  type: 'text' | 'mention';
  link?: string;
}

interface IMention {
  _id: string
  label: string
  link?: string
}

export function useMentionTokens(
  text: string,
  mentions?: IMention[],
) {
  const regex = /([@#]\w+)/g;

  const result: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      result.push({
        text: text.slice(last, m.index),
        type: 'text',
      });
    }

    const label = m[0].slice(1).toLowerCase();

    const mention = mentions?.find(
      (m) => m.label?.toLowerCase() === label?.toLowerCase(),
    );

    result.push({
      text: m[0],
      type: 'mention',
      link: mention?.link,
    });

    last = regex.lastIndex;
  }

  if (last < text.length) {
    result.push({
      text: text.slice(last),
      type: 'text',
    });
  }

  return result;
}
