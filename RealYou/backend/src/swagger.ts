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
        { name: 'quizzes', description: 'クイズ関連' },
        { name: 'register', description: 'ユーザー登録・診断' },
        { name: 'health', description: 'サーバー状態確認' },
    ],
    paths: {
        '/health': {
            get: {
                tags: ['health'],
                summary: 'ヘルスチェック',
                responses: {
                    200: {
                        description: 'サーバー稼働中',
                        content: {
                            'application/json': {
                                example: { status: 'ok', timestamp: '2026-02-28T12:00:00.000Z', database: 'connected', uptime: 120 },
                            },
                        },
                    },
                },
            },
        },

        '/api/quizzes': {
            get: {
                tags: ['quizzes'],
                summary: 'クイズ一覧取得',
                description: 'ユーザーの回答済みフラグ付きでクイズ一覧を返す',
                parameters: [
                    {
                        name: 'user_id',
                        in: 'query',
                        required: true,
                        schema: { type: 'string', format: 'uuid' },
                        description: 'ユーザーID',
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
                description: '発表テキストを元に Gemini AI でクイズを生成し DB に保存する',
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
                        content: { 'application/json': { example: { error: 'バリデーションエラー', details: [] } } },
                    },
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
                        content: { 'application/json': { example: { error: '指定されたクイズが存在しません' } } },
                    },
                },
            },
        },

        '/api/quizzes/{quiz_id}/submit': {
            post: {
                tags: ['quizzes'],
                summary: '解答送信・採点・経験値付与',
                description: '解答を送信して採点・ギャップ分析・経験値付与を行う。初回のみ earned_points が付与される。',
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
                                    user_id: { type: 'string', format: 'uuid', example: '46f441c6-cc35-4bd3-ab49-953f5a287c83' },
                                    self_evaluation_level: { type: 'integer', minimum: 1, maximum: 5, example: 3 },
                                    answers: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            required: ['question_id', 'selected_index'],
                                            properties: {
                                                question_id: { type: 'string', format: 'uuid' },
                                                selected_index: { type: 'integer', minimum: 0 },
                                            },
                                        },
                                        example: [{ question_id: '812a18a0-4dbc-48cc-8cc3-3312ff481c57', selected_index: 0 }],
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
                                example: {
                                    error: 'Validation failed',
                                    details: [{ code: 'invalid_type', path: ['user_id'], message: 'Invalid input: expected string, received undefined' }],
                                },
                            },
                        },
                    },
                },
            },
        },
    },
};
