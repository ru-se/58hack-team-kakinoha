// src/swagger.ts
// 実装コード（schemas/types）に基づく正確な OpenAPI 定義
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
    components: {
        schemas: {
            // 共通スキーマ
            BaselineScores: {
                type: 'object',
                properties: {
                    caution: { type: 'number', minimum: 0, maximum: 100 },
                    calmness: { type: 'number', minimum: 0, maximum: 100 },
                    logic: { type: 'number', minimum: 0, maximum: 100 },
                    cooperativeness: { type: 'number', minimum: 0, maximum: 100 },
                    positivity: { type: 'number', minimum: 0, maximum: 100 },
                },
            },
            ChimeraParameters: {
                type: 'object',
                properties: {
                    lucky: { type: 'integer', minimum: 0, maximum: 100 },
                    happy: { type: 'integer', minimum: 0, maximum: 100 },
                    nice: { type: 'integer', minimum: 0, maximum: 100 },
                    cute: { type: 'integer', minimum: 0, maximum: 100 },
                    cool: { type: 'integer', minimum: 0, maximum: 100 },
                },
            },
            ApiError: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'error' },
                    error: { type: 'string', example: 'server_error' },
                    message: { type: 'string', example: 'エラーが発生しました' },
                },
            },
        },
    },
    paths: {
        // =========================================================
        // Health
        // =========================================================
        '/health': {
            get: {
                tags: ['health'],
                summary: 'ヘルスチェック',
                description: 'サーバーとDB疎通確認',
                responses: {
                    200: {
                        description: '稼働中',
                        content: {
                            'application/json': {
                                example: { status: 'ok', timestamp: '2026-02-28T12:00:00.000Z', database: 'connected', uptime: 120 },
                            },
                        },
                    },
                    503: {
                        description: 'DB接続失敗',
                        content: {
                            'application/json': {
                                example: { status: 'error', timestamp: '2026-02-28T12:00:00.000Z', database: 'disconnected', uptime: 120 },
                            },
                        },
                    },
                },
            },
        },

        // =========================================================
        // Register  ← types/index.ts の RegisterRequest に準拠
        // =========================================================
        '/api/register': {
            post: {
                tags: ['register'],
                summary: 'ユーザー登録（MBTI + ベースライン回答）',
                description: `MBTI タイプ（任意）と 5問の自己評価アンケート(A/B/C/D)を回答してユーザーを登録する。
- A=100点, B=75点, C=25点, D=0点 に変換される
- MBTI を渡すとベースラインスコアが理論値で補正される`,
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['baseline_answers'],
                                properties: {
                                    mbti: {
                                        type: 'string',
                                        nullable: true,
                                        pattern: '^[IEie][SNsn][TFtf][JPjp]$',
                                        example: 'INTJ',
                                        description: 'MBTIタイプ（任意、4文字）',
                                    },
                                    baseline_answers: {
                                        type: 'object',
                                        required: ['q1_caution', 'q2_calmness', 'q3_logic', 'q4_cooperativeness', 'q5_positivity'],
                                        properties: {
                                            q1_caution: { type: 'string', enum: ['A', 'B', 'C', 'D'], description: '慎重さ' },
                                            q2_calmness: { type: 'string', enum: ['A', 'B', 'C', 'D'], description: '冷静さ' },
                                            q3_logic: { type: 'string', enum: ['A', 'B', 'C', 'D'], description: '論理性' },
                                            q4_cooperativeness: { type: 'string', enum: ['A', 'B', 'C', 'D'], description: '協調性' },
                                            q5_positivity: { type: 'string', enum: ['A', 'B', 'C', 'D'], description: '積極性' },
                                        },
                                        example: {
                                            q1_caution: 'A', q2_calmness: 'B', q3_logic: 'A',
                                            q4_cooperativeness: 'C', q5_positivity: 'B',
                                        },
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
                                example: { user_id: '46f441c6-cc35-4bd3-ab49-953f5a287c83', status: 'success' },
                            },
                        },
                    },
                    400: {
                        description: 'バリデーションエラー（MBTI形式 or 回答値不正）',
                        content: {
                            'application/json': {
                                example: { status: 'error', code: 'invalid_answers', message: 'Answers must be one of [A, B, C, D]. Invalid keys: q1_caution' },
                            },
                        },
                    },
                },
            },
        },

        // authSchema.ts: ChimeraRegisterSchema = { name, auth_type: 'dummy'|'pose', auth_payload? }
        '/api/register/chimera': {
            post: {
                tags: ['register'],
                summary: 'キメラ用ユーザー登録',
                description: 'キメラゲーム専用の軽量登録エンドポイント。ダミー認証のみサポート。',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'auth_type'],
                                properties: {
                                    name: { type: 'string', minLength: 1, example: '田中たろう' },
                                    auth_type: { type: 'string', enum: ['dummy', 'pose'], default: 'dummy', description: '現在 dummy のみサポート' },
                                    auth_payload: { description: '認証ペイロード（任意）', nullable: true },
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
                                example: { user_id: '46f441c6-cc35-4bd3-ab49-953f5a287c83', message: '登録成功' },
                            },
                        },
                    },
                    400: {
                        description: 'バリデーションエラー or 未サポートの auth_type',
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
        // Games  ← types/index.ts: SubmitGameRequest
        // game_type は 1=利用規約, 2=AIチャット, 3=グループチャット
        // =========================================================
        '/api/games/submit': {
            post: {
                tags: ['games'],
                summary: 'ゲーム結果送信',
                description: `ミニゲームのプレイ結果を送信してDBに保存する。
- game_type 1: 利用規約ゲーム
- game_type 2: AI チャットゲーム
- game_type 3: グループチャットゲーム`,
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['user_id', 'game_type', 'data'],
                                properties: {
                                    user_id: { type: 'string', format: 'uuid', example: '46f441c6-cc35-4bd3-ab49-953f5a287c83' },
                                    game_type: {
                                        type: 'integer',
                                        enum: [1, 2, 3],
                                        description: '1=利用規約, 2=AIチャット, 3=グループチャット',
                                        example: 3,
                                    },
                                    data: {
                                        type: 'object',
                                        description: 'ゲーム固有の結果データ（フリーフォーム）',
                                        example: { '食い気味度(ms)': 120, '過去ログ遡及(回)': 3 },
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
                                example: { status: 'success', message: 'Game 3 data saved' },
                            },
                        },
                    },
                    500: { description: 'サーバーエラー', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
                },
            },
        },

        // =========================================================
        // Results  ← types/index.ts: ResultResponse
        // =========================================================
        '/api/results/{user_id}/total-exp': {
            get: {
                tags: ['results'],
                summary: '総経験値取得（GrowTree連携用）',
                description: 'ユーザーの total_exp のみを返す軽量エンドポイント',
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
                        description: '総経験値',
                        content: {
                            'application/json': {
                                example: {
                                    total_exp: { web: 60, ai: 0, security: 0, infrastructure: 0, design: 0, game: 0 },
                                },
                            },
                        },
                    },
                    404: {
                        description: 'ユーザーが存在しない',
                        content: { 'application/json': { example: { status: 'error', code: 'user_not_found', message: 'User not found' } } },
                    },
                },
            },
        },

        '/api/results/{user_id}': {
            get: {
                tags: ['results'],
                summary: '診断結果取得',
                description: `3ゲームクリア後に診断結果を返す。キャッシュあり（analysis_results テーブル）。
- 3ゲーム未完了の場合は 400 エラー
- user_id が存在しない場合は 404 エラー`,
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
                        description: '診断結果',
                        content: {
                            'application/json': {
                                example: {
                                    user_id: '46f441c6-cc35-4bd3-ab49-953f5a287c83',
                                    self_mbti: 'INTJ',
                                    mbti_scores: { caution: 80, calmness: 70, logic: 90, cooperativeness: 40, positivity: 50 },
                                    scores: { caution: 72, calmness: 65, logic: 88, cooperativeness: 45, positivity: 55 },
                                    baseline_scores: { caution: 100, calmness: 75, logic: 100, cooperativeness: 25, positivity: 75 },
                                    gaps: { caution: -28, calmness: -10, logic: -12, cooperativeness: 5, positivity: 20 },
                                    game_breakdown: { game_1: { caution: 60 }, game_2: { logic: 80 }, game_3: { cooperativeness: 50 } },
                                    feedback: {
                                        title: '慎重な分析家タイプ',
                                        description: '論理的思考が強みですが、...',
                                        gap_point: '自己評価と実際の行動にズレがあります',
                                    },
                                    accuracy_score: 68,
                                    phase_summaries: {
                                        phase_1: '利用規約フェーズでは慎重さが際立ちました。',
                                        phase_2: 'AIチャットフェーズでは論理的な応答が多かったです。',
                                        phase_3: 'グループチャットフェーズでは積極的な発言が見られました。',
                                    },
                                    details: {},
                                },
                            },
                        },
                    },
                    400: {
                        description: '3ゲーム未完了',
                        content: { 'application/json': { example: { status: 'error', code: 'incomplete_games', message: 'All games must be completed' } } },
                    },
                    404: {
                        description: 'ユーザーが存在しない',
                        content: { 'application/json': { example: { status: 'error', code: 'user_not_found', message: 'User not found' } } },
                    },
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
                description: 'ユーザーの発話に対して AI がキャラクター設定に沿って返答を生成する',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['user_id', 'message'],
                                properties: {
                                    user_id: { type: 'string', format: 'uuid', example: '46f441c6-cc35-4bd3-ab49-953f5a287c83' },
                                    message: { type: 'string', example: 'こんにちは！' },
                                    conversation_history: {
                                        type: 'array',
                                        nullable: true,
                                        description: '過去の会話履歴（任意）',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                role: { type: 'string', enum: ['user', 'model'] },
                                                content: { type: 'string' },
                                            },
                                        },
                                        example: [{ role: 'user', content: 'やあ' }, { role: 'model', content: 'こんにちは！' }],
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
                                example: { response: 'やあ！元気だよ！', emotion: 'happy', confidence: 0.92 },
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
                description: 'ユーザーの回答済みフラグ付きで生成日時降順のクイズ一覧を返す',
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
                                    quizzes: [{
                                        quiz_id: 'a26cce4a-d19c-4466-8070-10404b47f98c',
                                        title: 'React & Socket.io リアルタイムチャットクイズ',
                                        genres: { web: 1.0 },
                                        max_points: 60,
                                        created_at: '2026-02-28T10:00:00.000Z',
                                        answered: false,
                                    }],
                                },
                            },
                        },
                    },
                    400: { description: 'user_id 未指定', content: { 'application/json': { example: { error: 'user_id は必須です' } } } },
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
                                    user_id: { type: 'string', format: 'uuid', example: '46f441c6-cc35-4bd3-ab49-953f5a287c83' },
                                    presentation_text: { type: 'string', minLength: 1, maxLength: 10000, example: 'ReactのuseStateとuseEffectについて説明します...' },
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
                                example: { quiz_id: 'e3159175-a72e-4042-84ab-e2daa7a1db4e', max_points: 40, genres: { web: 1 }, message: 'クイズを生成しました' },
                            },
                        },
                    },
                    400: { description: 'バリデーションエラー', content: { 'application/json': { example: { error: 'バリデーションエラー', details: [] } } } },
                },
            },
        },

        '/api/quizzes/{quiz_id}/questions': {
            get: {
                tags: ['quizzes'],
                summary: '問題一覧取得',
                description: '指定クイズの問題を order_num 順で返す',
                parameters: [
                    {
                        name: 'quiz_id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid', example: 'a26cce4a-d19c-4466-8070-10404b47f98c' },
                        description: 'クイズのUUID',
                    },
                ],
                responses: {
                    200: {
                        description: '問題一覧',
                        content: {
                            'application/json': {
                                example: {
                                    questions: [{
                                        id: '812a18a0-4dbc-48cc-8cc3-3312ff481c57',
                                        quiz_id: 'a26cce4a-d19c-4466-8070-10404b47f98c',
                                        order_num: 1,
                                        question_text: 'useStateとは何ですか？',
                                        options: ['状態管理フック', 'ルーティング', 'スタイリング', 'テスト'],
                                        correct_index: 0,
                                    }],
                                },
                            },
                        },
                    },
                    404: { description: 'クイズが存在しない', content: { 'application/json': { example: { error: '指定されたクイズが存在しません' } } } },
                },
            },
        },

        // schemas/quizSchema.ts: QuizSubmitRequestSchema
        // answers: z.record(q_\d+, z.number().int().min(1).max(4))
        '/api/quizzes/{quiz_id}/submit': {
            post: {
                tags: ['quizzes'],
                summary: '解答送信・採点・経験値付与',
                description: `解答を送信して採点・ギャップ分析・経験値計算・履歴保存を行う。
- **answers** は \`{ "q_1": 2, "q_2": 3 }\` 形式（選択肢は1〜4）
- **earned_points** は初回解答時のみ付与`                ,
                parameters: [
                    {
                        name: 'quiz_id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', format: 'uuid', example: 'a26cce4a-d19c-4466-8070-10404b47f98c' },
                        description: 'クイズのUUID',
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
                                    user_id: { type: 'string', format: 'uuid', example: '46f441c6-cc35-4bd3-ab49-953f5a287c83' },
                                    self_evaluation_level: {
                                        type: 'integer',
                                        minimum: 1,
                                        maximum: 5,
                                        description: '自己評価レベル（1=かなり低い〜5=かなり高い）',
                                        example: 3,
                                    },
                                    answers: {
                                        type: 'object',
                                        description: 'キーは q_1, q_2 ... の形式。値は1〜4の選択肢番号。',
                                        additionalProperties: {
                                            type: 'integer',
                                            minimum: 1,
                                            maximum: 4,
                                        },
                                        example: { q_1: 2, q_2: 3, q_3: 1 },
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
                                    total_exp: { web: 60, ai: 0, security: 0, infrastructure: 0, design: 0, game: 0 },
                                },
                            },
                        },
                    },
                    400: {
                        description: 'バリデーションエラー',
                        content: {
                            'application/json': {
                                example: { error: 'Validation failed', details: [{ code: 'invalid_type', path: ['user_id'], message: 'Invalid input: expected string, received undefined' }] },
                            },
                        },
                    },
                    500: {
                        description: 'クイズが存在しない等のサーバーエラー',
                        content: { 'application/json': { example: { status: 'error', error: 'server_error', message: 'クイズの取得に失敗しました' } } },
                    },
                },
            },
        },
    },
};
