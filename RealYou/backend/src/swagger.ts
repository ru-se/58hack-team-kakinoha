// src/swagger.ts
export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'RealYou Backend API',
        version: '1.0.0',
        description: '58ハッカソン - RealYou バックエンド API ドキュメント',
    },
    servers: [{ url: 'http://localhost:3001', description: 'ローカル開発サーバー' }],
    tags: [
        { name: 'health', description: 'サーバー状態確認' },
        { name: 'register', description: 'ユーザー登録・診断' },
        { name: 'games', description: 'ゲーム結果送信' },
        { name: 'results', description: 'ユーザー結果取得' },
        { name: 'voice', description: 'AI 音声応答' },
        { name: 'quizzes', description: 'クイズ関連' },
    ],
    paths: {
        // =========================================================
        // Health
        // =========================================================
        '/health': {
            get: {
                tags: ['health'],
                summary: 'ヘルスチェック',
                description: 'サーバーとDBの疎通確認',
                responses: {
                    200: {
                        description: 'サーバー稼働中',
                        content: {
                            'application/json': {
                                example: {
                                    status: 'ok',
                                    timestamp: '2026-02-28T12:00:00.000Z',
                                    database: 'connected',
                                    uptime: 120,
                                },
                            },
                        },
                    },
                    503: {
                        description: 'DB 接続失敗',
                        content: {
                            'application/json': {
                                example: {
                                    status: 'error',
                                    timestamp: '2026-02-28T12:00:00.000Z',
                                    database: 'disconnected',
                                    uptime: 120,
                                },
                            },
                        },
                    },
                },
            },
        },

        // =========================================================
        // Register
        // =========================================================
        '/api/register': {
            post: {
                tags: ['register'],
                summary: 'ユーザー登録（MBTI・ベースライン）',
                description: 'MBTI タイプとベースライン回答を元にユーザーを登録する',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['mbti', 'baseline_answers'],
                                properties: {
                                    mbti: { type: 'string', example: 'INTJ', description: 'MBTIタイプ（4文字）' },
                                    baseline_answers: {
                                        type: 'object',
                                        description: '各質問への回答 A/B/C/D',
                                        example: { q1: 'A', q2: 'B', q3: 'C', q4: 'D' },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: '登録成功',
                        content: {
                            'application/json': {
                                example: {
                                    user_id: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                                    status: 'success',
                                },
                            },
                        },
                    },
                    500: { description: 'サーバーエラー' },
                },
            },
        },

        '/api/register/chimera': {
            post: {
                tags: ['register'],
                summary: 'キメラ用ユーザー登録',
                description: '追加パラメータを含むキメラ固有の登録フロー',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                description: 'ChimeraRegisterSchema に準拠したオブジェクト',
                                example: {
                                    mbti: 'ENFP',
                                    baseline_answers: { q1: 'A', q2: 'B', q3: 'C', q4: 'D' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: '登録成功',
                        content: {
                            'application/json': {
                                example: {
                                    user_id: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                                    message: '登録成功',
                                },
                            },
                        },
                    },
                    400: {
                        description: 'バリデーションエラー',
                        content: {
                            'application/json': {
                                example: { error: 'バリデーションエラー', details: [] },
                            },
                        },
                    },
                },
            },
        },

        // =========================================================
        // Games
        // =========================================================
        '/api/games/submit': {
            post: {
                tags: ['games'],
                summary: 'ゲーム結果送信',
                description: 'ミニゲームのプレイ結果を送信して DB に保存する',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['user_id', 'game_type', 'data'],
                                properties: {
                                    user_id: {
                                        type: 'string',
                                        format: 'uuid',
                                        example: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                                    },
                                    game_type: {
                                        type: 'string',
                                        example: 'helpdesk',
                                        description: 'ゲーム種別（helpdesk / group_chat など）',
                                    },
                                    data: {
                                        type: 'object',
                                        description: 'ゲーム固有の結果データ',
                                        example: {
                                            '食い気味度(ms)': 120,
                                            '過去ログ遡及(回)': 3,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: '送信成功',
                        content: {
                            'application/json': {
                                example: { status: 'success', message: 'Game helpdesk data saved' },
                            },
                        },
                    },
                    500: { description: 'サーバーエラー' },
                },
            },
        },

        // =========================================================
        // Results
        // =========================================================
        '/api/results/{user_id}': {
            get: {
                tags: ['results'],
                summary: 'ユーザー結果取得',
                description: 'ゲーム結果・ギャップ分析・キメラパラメータを返す',
                parameters: [
                    {
                        name: 'user_id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                        example: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                    },
                ],
                responses: {
                    200: {
                        description: '結果データ',
                        content: {
                            'application/json': {
                                example: {
                                    user_id: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                                    chimera_parameters: {
                                        lucky: 80,
                                        happy: 60,
                                        nice: 70,
                                        cute: 90,
                                        cool: 50,
                                    },
                                    game_logs: [],
                                },
                            },
                        },
                    },
                    500: { description: 'サーバーエラー' },
                },
            },
        },

        // =========================================================
        // Voice
        // =========================================================
        '/api/voice/respond': {
            post: {
                tags: ['voice'],
                summary: 'AI 音声応答生成',
                description: 'ユーザーの発話に対して AI がキャラクター設定に沿って返答する',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['user_id', 'message'],
                                properties: {
                                    user_id: {
                                        type: 'string',
                                        format: 'uuid',
                                        example: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                                    },
                                    message: { type: 'string', example: 'こんにちは！' },
                                    conversation_history: {
                                        type: 'array',
                                        description: '過去の会話履歴（任意）',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                role: { type: 'string', enum: ['user', 'model'] },
                                                content: { type: 'string' },
                                            },
                                        },
                                        example: [{ role: 'user', content: '前回の質問' }, { role: 'model', content: '前回の返答' }],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'AI 応答',
                        content: {
                            'application/json': {
                                example: {
                                    response: 'やあ！元気だよ！',
                                    emotion: 'happy',
                                    confidence: 0.92,
                                },
                            },
                        },
                    },
                    400: {
                        description: 'user_id 未指定 or 存在しない user_id',
                        content: {
                            'application/json': {
                                example: { status: 'error', code: 'invalid_request', message: 'user_id is required' },
                            },
                        },
                    },
                },
            },
        },

        // =========================================================
        // Quizzes
        // =========================================================
        '/api/quizzes': {
            get: {
                tags: ['quizzes'],
                summary: 'クイズ一覧取得',
                description: 'ユーザーの回答済みフラグ付きでクイズ一覧を生成日時の降順で返す',
                parameters: [
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                        example: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                    },
                ],
                responses: {
                    200: {
                        description: 'クイズ一覧',
                        content: {
                            'application/json': {
                                example: {
                                    quizzes: [
                                        {
                                            quiz_id: 'a26cce4a-d19c-4466-8070-10404b47f98c',
                                            title: 'React & Socket.io リアルタイムチャットクイズ',
                                            genres: { web: 1.0 },
                                            max_points: 60,
                                            created_at: '2026-02-28T10:00:00.000Z',
                                            answered: false,
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    400: {
                        description: 'user_id 未指定',
                        content: { 'application/json': { example: { error: 'user_id は必須です' } } },
                    },
                },
            },
        },

        '/api/quizzes/generate': {
            post: {
                tags: ['quizzes'],
                summary: 'AI クイズ生成',
                description: '発表テキストを元に Gemini AI でクイズを生成し DB に保存する（数秒かかる）',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['user_id', 'presentation_text'],
                                properties: {
                                    user_id: {
                                        type: 'string',
                                        format: 'uuid',
                                        example: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                                    },
                                    presentation_text: {
                                        type: 'string',
                                        minLength: 1,
                                        maxLength: 10000,
                                        example: 'ReactのuseStateとuseEffectについて説明します...',
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'クイズ生成成功',
                        content: {
                            'application/json': {
                                example: {
                                    quiz_id: 'e3159175-a72e-4042-84ab-e2daa7a1db4e',
                                    max_points: 40,
                                    genres: { web: 1 },
                                    message: 'クイズを生成しました',
                                },
                            },
                        },
                    },
                    400: {
                        description: 'バリデーションエラー',
                        content: {
                            'application/json': {
                                example: { error: 'バリデーションエラー', details: [] },
                            },
                        },
                    },
                },
            },
        },

        '/api/quizzes/{quiz_id}/questions': {
            get: {
                tags: ['quizzes'],
                summary: '問題一覧取得',
                description: '指定クイズの問題を order_num 順で返す。クイズが存在しない場合は 404。',
                parameters: [
                    {
                        name: 'quiz_id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                        example: 'a26cce4a-d19c-4466-8070-10404b47f98c',
                    },
                ],
                responses: {
                    200: {
                        description: '問題一覧',
                        content: {
                            'application/json': {
                                example: {
                                    questions: [
                                        {
                                            id: '812a18a0-4dbc-48cc-8cc3-3312ff481c57',
                                            quiz_id: 'a26cce4a-d19c-4466-8070-10404b47f98c',
                                            order_num: 1,
                                            question_text: 'useStateとは何ですか？',
                                            options: ['状態管理フック', 'ルーティング', 'スタイリング', 'テスト'],
                                            correct_index: 0,
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    404: {
                        description: 'クイズが存在しない',
                        content: {
                            'application/json': {
                                example: { error: '指定されたクイズが存在しません' },
                            },
                        },
                    },
                },
            },
        },

        '/api/quizzes/{quiz_id}/submit': {
            post: {
                tags: ['quizzes'],
                summary: '解答送信・採点・経験値付与',
                description: `解答を送信して採点・ギャップ分析・経験値計算・履歴保存を行う。
- **採点**は correct_index との照合で実施（DB クエリは1回）
- **earned_points** は初回解答時のみ付与される
- **total_exp** はユーザーの累計経験値（web/ai/security/infrastructure/design/game）`,
                parameters: [
                    {
                        name: 'quiz_id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                        example: 'a26cce4a-d19c-4466-8070-10404b47f98c',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['user_id', 'self_evaluation_level', 'answers'],
                                properties: {
                                    user_id: {
                                        type: 'string',
                                        format: 'uuid',
                                        example: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                                    },
                                    self_evaluation_level: {
                                        type: 'integer',
                                        minimum: 1,
                                        maximum: 5,
                                        description: '自己評価レベル（1=かなり低い〜5=かなり高い）',
                                        example: 3,
                                    },
                                    answers: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            required: ['question_id', 'selected_index'],
                                            properties: {
                                                question_id: { type: 'string', format: 'uuid' },
                                                selected_index: {
                                                    type: 'integer',
                                                    minimum: 0,
                                                    description: '選択した選択肢のインデックス（0始まり）',
                                                },
                                            },
                                        },
                                        example: [
                                            { question_id: '812a18a0-4dbc-48cc-8cc3-3312ff481c57', selected_index: 0 },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: '採点・分析結果',
                        content: {
                            'application/json': {
                                example: {
                                    actual_score: 100,
                                    gap: 40,
                                    feedback_message: '【謙虚タイプ】実際の理解度より自己評価が低めです。自信を持ちましょう！',
                                    chimera_parameters: { lucky: 90, happy: 60, nice: 100, cute: 100, cool: 30 },
                                    rival_parameters: { lucky: 5, happy: 82, nice: 44, cute: 13, cool: 62 },
                                    earned_points: 60,
                                    total_exp: {
                                        web: 60,
                                        ai: 0,
                                        security: 0,
                                        infrastructure: 0,
                                        design: 0,
                                        game: 0,
                                    },
                                },
                            },
                        },
                    },
                    400: {
                        description: 'バリデーションエラー',
                        content: {
                            'application/json': {
                                example: {
                                    error: 'Validation failed',
                                    details: [
                                        {
                                            code: 'invalid_type',
                                            path: ['user_id'],
                                            message: 'Invalid input: expected string, received undefined',
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    500: {
                        description: 'クイズが存在しない等のサーバーエラー',
                        content: {
                            'application/json': {
                                example: {
                                    status: 'error',
                                    error: 'server_error',
                                    message: 'クイズの取得に失敗しました',
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
