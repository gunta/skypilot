const ESC = '\u001B';
const OSC = `${ESC}]`;
const ST = `${ESC}\\`;
const BEL = '\u0007';

export const THUMBNAIL_CELL_WIDTH = 32;
export const THUMBNAIL_CELL_HEIGHT = 18;

export const supportsItermInlineImages = (): boolean => process.env.TERM_PROGRAM === 'iTerm.app';

export const wrapForTmux = (sequence: string): string => {
  if (!process.env.TMUX) {
    return sequence;
  }
  const escaped = sequence.split(ESC).join(`${ESC}${ESC}`);
  return `${ESC}Ptmux;${escaped}${ST}`;
};

export const makeItermPayload = (name: string, base64: string): string => {
  const encodedName = Buffer.from(name).toString('base64');
  return `${OSC}1337;File=name=${encodedName};inline=1;width=${THUMBNAIL_CELL_WIDTH};height=${THUMBNAIL_CELL_HEIGHT};preserveAspectRatio=1:${base64}${BEL}`;
};
