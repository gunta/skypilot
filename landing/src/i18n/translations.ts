export const translations = {
  en: {
    // Hero Section
    'hero.title': 'Your Sora 2 Co-pilot',
    'hero.subtitle': 'The most secure way to use OpenAI\'s video API. Free, open source, runs entirely on your machine with your own API key.',
    'hero.badge1': 'No watermarks',
    'hero.badge2': 'BYOK (Bring Your Own Key)',
    'hero.badge3': '100% private',
    'hero.badge4': 'Pro quality',
    'hero.cta.try': 'Try Now',
    'hero.cta.github': 'View on GitHub',
    'hero.sponsor': 'Sponsor this project',
    
    // Value Props
    'valueprops.title': 'Why SkyPilot is Different',
    'valueprops.zero.title': 'No Watermarks, Ever',
    'valueprops.zero.desc1': 'Your videos are clean—no Sora watermarks.',
    'valueprops.zero.desc2': 'Full API access means professional-quality output with Sora 2 Pro.',
    'valueprops.cheap.title': 'BYOK - Your Key, Your Control',
    'valueprops.cheap.desc1': 'Use your own OpenAI API key. No middleman, no markup.',
    'valueprops.cheap.desc2': 'You pay OpenAI directly. We take nothing. Full transparency.',
    'valueprops.transparent.title': 'Transparent & Open Source',
    'valueprops.transparent.desc1': 'MIT licensed. Audit every line of code.',
    'valueprops.transparent.desc2': 'No black boxes, no vendor lock-in.',
    
    // Problem/Solution
    'problems.title': 'Tired of...',
    'problems.p1': 'Worrying where your API key is stored?',
    'problems.p2': 'Bill shock from unexpected costs?',
    'problems.p3': 'Complex SDKs and manual API calls?',
    'problems.p4': 'Proprietary tools you can\'t trust?',
    'solutions.title': 'SkyPilot gives you...',
    'solutions.s1': 'CLI for instant video generation',
    'solutions.s2': 'TUI dashboard for real-time monitoring',
    'solutions.s3': 'Built-in cost calculator before you spend',
    'solutions.s4': 'Multi-currency support (150+ currencies)',
    
    // Features
    'features.title': 'Features',
    'features.available': 'Currently Available',
    'features.command.title': 'One Command, Infinite Videos',
    'features.command.desc1': 'npx skypilot - zero config, instant start',
    'features.command.desc2': 'Full control over model, duration, resolution',
    'features.dashboard.title': 'Beautiful Terminal Dashboard',
    'features.dashboard.desc1': 'Live TUI with progress tracking',
    'features.dashboard.desc2': 'Sortable job list with costs',
    'features.dashboard.desc3': 'Keyboard shortcuts for power users',
    'features.cost.title': 'Never Get Bill-Shocked',
    'features.cost.desc1': 'Real-time cost estimates in your currency',
    'features.cost.desc2': 'Track every generation\'s actual cost',
    'features.cost.desc3': 'Detailed pricing breakdown',
    'features.privacy.title': 'Privacy First with BYOK',
    'features.privacy.desc1': 'No telemetry, no tracking, no servers',
    'features.privacy.desc2': 'Your videos stay on your machine',
    'features.privacy.desc3': 'Your API key never leaves your computer',
    
    // Cost Calculator
    'calc.title': 'Cost Calculator',
    'calc.model': 'Model',
    'calc.duration': 'Duration',
    'calc.resolution': 'Resolution',
    'calc.quantity': 'Quantity',
    'calc.total': 'Total Cost',
    'calc.perVideo': 'per video',
    'calc.noMarkup': 'No markup. You pay OpenAI directly in USD.',
    'calc.cta': 'Start generating →',
    
    // Installation
    'install.title': 'Quick Start',
    'install.subtitle': 'From zero to your first AI video in 30 seconds',
    'install.comment1': 'Zero install - just run it once',
    'install.comment2': 'Or install globally for faster access',
    'install.comment3': 'Launch the beautiful TUI dashboard',
    'install.comment4': 'Watch progress and download when ready',
    'install.copied': 'Copied!',
    
    // Coming Soon
    'coming.title': 'The Future of SkyPilot',
    'coming.gui.title': 'Web GUI',
    'coming.gui.desc1': 'Generate videos from your browser',
    'coming.gui.desc2': 'Drag-and-drop reference images',
    'coming.gui.desc3': 'Visual prompt builder',
    'coming.gui.badge': 'In Development',
    'coming.native.title': 'Native Desktop App',
    'coming.native.desc1': 'Mac, Windows, Linux support',
    'coming.native.desc2': 'Native file system integration',
    'coming.native.desc3': 'System tray monitoring',
    'coming.native.badge': 'Planned',
    'coming.cta': 'Star on GitHub to get notified',
    
    // Use Cases
    'usecases.title': 'Use Cases',
    'usecases.creators.title': 'Content Creators',
    'usecases.creators.desc1': 'Generate social media videos on-demand',
    'usecases.creators.desc2': 'No monthly subscription—pay only when you create',
    'usecases.developers.title': 'Developers',
    'usecases.developers.desc1': 'Integrate via programmatic API',
    'usecases.developers.desc2': 'Full TypeScript support',
    'usecases.privacy.title': 'Privacy-Conscious Users',
    'usecases.privacy.desc1': 'Your API key never leaves your machine',
    'usecases.privacy.desc2': 'Audit the source code yourself',
    
    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'Is this official OpenAI software?',
    'faq.a1': 'No. SkyPilot is an unofficial, community-built tool. We\'re not affiliated with OpenAI.',
    'faq.q2': 'How much does SkyPilot cost?',
    'faq.a2': 'SkyPilot is 100% free and open source (MIT license). You pay OpenAI directly for API usage—we don\'t charge anything.',
    'faq.q3': 'Where is my API key stored?',
    'faq.a3': 'In your environment variables or local .env file. It never touches our servers because SkyPilot runs entirely on your machine.',
    'faq.q4': 'What\'s the difference between CLI and TUI?',
    'faq.a4': 'CLI is for quick one-off commands. TUI is a full dashboard interface that shows all your jobs, progress, and costs in real-time.',
    'faq.q5': 'Can I use this in production?',
    'faq.a5': 'Yes! SkyPilot is MIT licensed. Use it for personal projects, commercial work, or integrate it into your own apps.',
    'faq.q6': 'Do you support Remix/Image-to-Video?',
    'faq.a6': 'Yes! Use --input-reference flag to provide a reference image, or use the remix command for existing videos.',
    'faq.q7': 'What is Sora 2 Pro quality?',
    'faq.a7': 'Sora 2 Pro delivers the highest quality video generation with superior detail, motion, and realism. SkyPilot gives you direct access at cost.',
    'faq.q8': 'What content restrictions apply?',
    'faq.a8': 'OpenAI enforces guardrails: content must be suitable for under-18 audiences, no copyrighted characters/music, no real people (including public figures), and no input images with human faces. Prompts violating these rules will fail.',
    'faq.q9': 'When will the GUI be available?',
    'faq.a9': 'We\'re actively developing it. Star the repo on GitHub to get notified of new releases.',
    
    // Final CTA
    'cta.title': 'Ready to Take Flight?',
    'cta.subtitle': 'No signup. No credit card. Just your OpenAI API key.',
    'cta.star': 'Star on GitHub',
    'cta.npm': 'View on npm',
    'cta.docs': 'Read the Docs',
    'cta.donate': 'Support via GitHub Sponsors',
    
    // Footer
    'footer.docs': 'Documentation',
    'footer.github': 'GitHub Repository',
    'footer.npm': 'npm Package',
    'footer.license': 'License (MIT)',
    'footer.issues': 'Issues / Bug Reports',
    'footer.disclaimer': 'SkyPilot is an unofficial tool for OpenAI\'s Sora 2 API. Not affiliated with, endorsed by, or sponsored by OpenAI.',
    'footer.credits': 'Built with Astro',
    'footer.contributors': 'Open source contributors welcome',
  },
  ja: {
    // Hero Section
    'hero.title': 'あなたの Sora 2 副操縦士',
    'hero.subtitle': 'OpenAI の動画 API を使用する最も安全な方法。無料、オープンソース、あなた自身の API キーで完全にマシン上で実行。',
    'hero.badge1': 'ウォーターマークなし',
    'hero.badge2': 'BYOK（自分のキーを使用）',
    'hero.badge3': '100% プライベート',
    'hero.badge4': 'Pro 品質',
    'hero.cta.try': '今すぐ試す',
    'hero.cta.github': 'GitHub で見る',
    'hero.sponsor': 'このプロジェクトをスポンサー',
    
    // Value Props
    'valueprops.title': 'SkyPilot が違う理由',
    'valueprops.zero.title': 'ウォーターマーク一切なし',
    'valueprops.zero.desc1': 'あなたの動画はクリーン—Sora のウォーターマークなし。',
    'valueprops.zero.desc2': 'フル API アクセスで Sora 2 Pro のプロ品質出力。',
    'valueprops.cheap.title': 'BYOK - あなたのキー、あなたの管理',
    'valueprops.cheap.desc1': '自分の OpenAI API キーを使用。仲介者なし、マークアップなし。',
    'valueprops.cheap.desc2': 'OpenAI に直接支払い。私たちは何も取りません。完全な透明性。',
    'valueprops.transparent.title': '透明でオープンソース',
    'valueprops.transparent.desc1': 'MIT ライセンス。すべてのコードを監査できます。',
    'valueprops.transparent.desc2': 'ブラックボックスなし、ベンダーロックインなし。',
    
    // Problem/Solution
    'problems.title': 'こんなことに困っていませんか...',
    'problems.p1': 'API キーがどこに保存されているか心配？',
    'problems.p2': '予期しないコストによる請求ショック？',
    'problems.p3': '複雑な SDK や手動 API 呼び出し？',
    'problems.p4': '信頼できないプロプライエタリツール？',
    'solutions.title': 'SkyPilot が提供するもの...',
    'solutions.s1': '即座に動画生成できる CLI',
    'solutions.s2': 'リアルタイム監視用の TUI ダッシュボード',
    'solutions.s3': '支出前の組み込みコスト計算機',
    'solutions.s4': '多通貨対応（150 以上の通貨）',
    
    // Features
    'features.title': '機能',
    'features.available': '現在利用可能',
    'features.command.title': 'ワンコマンドで無限の動画',
    'features.command.desc1': 'npx skypilot - 設定不要、即座に開始',
    'features.command.desc2': 'モデル、時間、解像度を完全制御',
    'features.dashboard.title': '美しいターミナルダッシュボード',
    'features.dashboard.desc1': '進行状況追跡付きライブ TUI',
    'features.dashboard.desc2': 'コスト付きソート可能なジョブリスト',
    'features.dashboard.desc3': 'パワーユーザー向けキーボードショートカット',
    'features.cost.title': '請求ショックなし',
    'features.cost.desc1': 'あなたの通貨でリアルタイムコスト見積もり',
    'features.cost.desc2': 'すべての生成の実際のコストを追跡',
    'features.cost.desc3': '詳細な料金内訳',
    'features.privacy.title': 'BYOK でプライバシー第一',
    'features.privacy.desc1': 'テレメトリなし、トラッキングなし、サーバーなし',
    'features.privacy.desc2': '動画はあなたのマシンに残ります',
    'features.privacy.desc3': 'API キーはあなたのコンピュータから出ません',
    
    // Cost Calculator
    'calc.title': 'コスト計算機',
    'calc.model': 'モデル',
    'calc.duration': '時間',
    'calc.resolution': '解像度',
    'calc.quantity': '数量',
    'calc.total': '合計コスト',
    'calc.perVideo': '動画あたり',
    'calc.noMarkup': 'マークアップなし。OpenAI への支払いは米ドル建てです（参考価格：1ドル=150円）。',
    'calc.cta': '生成を開始 →',
    
    // Installation
    'install.title': 'クイックスタート',
    'install.subtitle': 'ゼロから最初の AI 動画まで 30 秒',
    'install.comment1': 'インストール不要 - 一度実行するだけ',
    'install.comment2': 'または高速アクセスのためにグローバルインストール',
    'install.comment3': '美しい TUI ダッシュボードを起動',
    'install.comment4': '進行状況を監視して準備ができたらダウンロード',
    'install.copied': 'コピーしました！',
    
    // Coming Soon
    'coming.title': 'SkyPilot の未来',
    'coming.gui.title': 'Web GUI',
    'coming.gui.desc1': 'ブラウザから動画を生成',
    'coming.gui.desc2': '参照画像のドラッグ＆ドロップ',
    'coming.gui.desc3': 'ビジュアルプロンプトビルダー',
    'coming.gui.badge': '開発中',
    'coming.native.title': 'ネイティブデスクトップアプリ',
    'coming.native.desc1': 'Mac、Windows、Linux サポート',
    'coming.native.desc2': 'ネイティブファイルシステム統合',
    'coming.native.desc3': 'システムトレイ監視',
    'coming.native.badge': '計画中',
    'coming.cta': 'GitHub でスターして通知を受け取る',
    
    // Use Cases
    'usecases.title': 'ユースケース',
    'usecases.creators.title': 'コンテンツクリエイター',
    'usecases.creators.desc1': 'オンデマンドでソーシャルメディア動画を生成',
    'usecases.creators.desc2': '月額サブスクリプションなし—作成時のみ支払い',
    'usecases.developers.title': '開発者',
    'usecases.developers.desc1': 'プログラマティック API で統合',
    'usecases.developers.desc2': '完全な TypeScript サポート',
    'usecases.privacy.title': 'プライバシー重視のユーザー',
    'usecases.privacy.desc1': 'API キーがマシンから出ることはありません',
    'usecases.privacy.desc2': 'ソースコードを自分で監査',
    
    // FAQ
    'faq.title': 'よくある質問',
    'faq.q1': 'これは公式の OpenAI ソフトウェアですか？',
    'faq.a1': 'いいえ。SkyPilot はコミュニティが構築した非公式ツールです。OpenAI とは提携していません。',
    'faq.q2': 'SkyPilot の料金はいくらですか？',
    'faq.a2': 'SkyPilot は 100% 無料でオープンソース（MIT ライセンス）です。API 使用料は OpenAI に直接支払います—私たちは何も請求しません。',
    'faq.q3': 'API キーはどこに保存されますか？',
    'faq.a3': '環境変数またはローカルの .env ファイルに保存されます。SkyPilot は完全にあなたのマシン上で実行されるため、私たちのサーバーには触れません。',
    'faq.q4': 'CLI と TUI の違いは何ですか？',
    'faq.a4': 'CLI は素早い一回限りのコマンド用です。TUI はすべてのジョブ、進行状況、コストをリアルタイムで表示するフルダッシュボードインターフェースです。',
    'faq.q5': '本番環境で使用できますか？',
    'faq.a5': 'はい！SkyPilot は MIT ライセンスです。個人プロジェクト、商用作業、または独自のアプリに統合できます。',
    'faq.q6': 'リミックス/画像から動画をサポートしていますか？',
    'faq.a6': 'はい！--input-reference フラグで参照画像を提供するか、既存の動画には remix コマンドを使用します。',
    'faq.q7': 'Sora 2 Pro 品質とは何ですか？',
    'faq.a7': 'Sora 2 Pro は、優れたディテール、モーション、リアリズムで最高品質の動画生成を提供します。SkyPilot は原価で直接アクセスできます。',
    'faq.q8': 'どのようなコンテンツ制限がありますか？',
    'faq.a8': 'OpenAI はガードレールを適用：18 歳未満の視聴者に適したコンテンツのみ、著作権で保護されたキャラクター/音楽は不可、実在の人物（公人を含む）は生成不可、人間の顔を含む入力画像は現在拒否されます。これらのルールに違反するプロンプトは失敗します。',
    'faq.q9': 'GUI はいつ利用可能になりますか？',
    'faq.a9': '積極的に開発中です。GitHub でリポジトリにスターを付けて新しいリリースの通知を受け取ってください。',
    
    // Final CTA
    'cta.title': 'テイクオフの準備はできましたか？',
    'cta.subtitle': 'サインアップ不要。クレジットカード不要。OpenAI API キーだけ。',
    'cta.star': 'GitHub でスター',
    'cta.npm': 'npm で見る',
    'cta.docs': 'ドキュメントを読む',
    'cta.donate': 'GitHub Sponsors でサポート',
    
    // Footer
    'footer.docs': 'ドキュメント',
    'footer.github': 'GitHub リポジトリ',
    'footer.npm': 'npm パッケージ',
    'footer.license': 'ライセンス (MIT)',
    'footer.issues': '問題 / バグ報告',
    'footer.disclaimer': 'SkyPilot は OpenAI の Sora 2 API の非公式ツールです。OpenAI によって承認、推奨、またはスポンサーされていません。',
    'footer.credits': 'Astro で構築',
    'footer.contributors': 'オープンソース貢献者を歓迎',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang][key] || translations.en[key];
}

export function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ja')) return 'ja';
  
  return 'en';
}

