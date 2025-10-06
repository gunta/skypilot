import { spawn } from 'node:child_process';

interface CommandSpec {
  command: string;
  args: string[];
}

const buildCommandCandidates = (): CommandSpec[] => {
  const platform = process.platform;

  if (platform === 'darwin') {
    return [
      { command: 'afplay', args: ['/System/Library/Sounds/Ping.aiff'] },
    ];
  }

  if (platform === 'win32') {
    return [
      {
        command: 'powershell',
        args: [
          '-NoProfile',
          '-Command',
          "[console]::beep(880,200); Start-Sleep -Milliseconds 50; [console]::beep(660,200)",
        ],
      },
    ];
  }

  return [
    { command: 'paplay', args: ['/usr/share/sounds/freedesktop/stereo/complete.oga'] },
    { command: 'aplay', args: ['/usr/share/sounds/alsa/Front_Center.wav'] },
  ];
};

const trySpawn = (spec: CommandSpec): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(spec.command, spec.args, { stdio: 'ignore' });

    let settled = false;

    child.on('error', (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });

    child.on('exit', (code) => {
      if (!settled) {
        settled = true;
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command '${spec.command}' exited with code ${code}`));
        }
      }
    });
  });

export const playSuccessSound = async (enabled: boolean) => {
  if (!enabled) {
    return;
  }

  const candidates = buildCommandCandidates();

  for (const spec of candidates) {
    try {
      await trySpawn(spec);
      return;
    } catch {
      // try the next candidate
    }
  }

  try {
    process.stdout.write('\u0007');
  } catch {
    // ignore if bell fails
  }
};
