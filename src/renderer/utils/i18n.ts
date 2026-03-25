// File: src/renderer/utils/i18n.ts
// Responsibility: Provides lightweight renderer-safe translations and layout direction helpers.
// Security: Presentation-only localization layer with no privileged access or hidden side effects.

export const translations = {
  en: {
    app_security_boundary_title: 'Security Boundary',
    app_security_boundary_description:
      'API keys are stored locally through the OS keychain and never exposed directly to the renderer.',
    modal_close: 'Close',
    banner_acknowledge_risk:
      'Complete the risk acknowledgment in onboarding before opening core trading pages.',

    sidebar_title: 'Secure Co-Pilot',
    sidebar_subtitle: 'Non-custodial desktop trading with simulation-first guardrails.',
    sidebar_dashboard_label: 'Dashboard',
    sidebar_dashboard_description: 'Market and AI overview',
    sidebar_portfolio_label: 'Portfolio',
    sidebar_portfolio_description: 'Read-only balances and watchlist',
    sidebar_trade_label: 'Trade',
    sidebar_trade_description: 'Human-in-the-loop order entry',
    sidebar_simulation_label: 'Simulation',
    sidebar_simulation_description: 'Paper trading controls',
    sidebar_settings_label: 'Settings',
    sidebar_settings_description: 'Security and preferences',
    sidebar_beta_label: 'Beta Program',
    sidebar_beta_description: 'Signup, criteria, and launch prep',
    sidebar_onboarding_label: 'Onboarding',
    sidebar_onboarding_description: 'Guided first-run flow',
    sidebar_security_model: 'Security Model',

    settings_preferences_title: 'Preferences',
    settings_phase5_message: 'Guardrails, locale, and launch readiness',
    settings_loading_title: 'Syncing safe preferences',
    settings_loading_description:
      'Loading or saving renderer-safe settings through the secure preload bridge.',
    settings_language_label: 'Language',
    settings_quote_currency_label: 'Quote Currency',
    settings_simulation_mode_label: 'Simulation mode',
    settings_live_trading_label: 'Enable live trading toggle',
    settings_ai_auto_execute_label: 'Enable AI auto-execute toggle',
    settings_save_preferences: 'Save Preferences',
    settings_saving: 'Saving...',
    settings_api_storage_title: 'API Key Storage',
    settings_api_storage_description:
      'Keys are encrypted locally, then persisted in the OS keychain. Live execution stays disabled in this scaffold.',
    settings_exchange_label: 'Exchange',
    settings_key_id_label: 'Key ID',
    settings_secret_label: 'Secret',
    settings_store_api_key: 'Store API Key',
    settings_language_en: 'English',
    settings_language_ar: 'العربية',

    tooltip_simulation_mode:
      'Simulation should stay enabled while learning the interface and validating flows safely.',
    tooltip_live_trading:
      'This toggle exposes the live-trading preference only. Real execution remains blocked in the scaffold.',
    tooltip_ai_auto_execute:
      'AI auto-execution is hard-disabled in V1 even if this preference is visible locally.',
    tooltip_exchange_testnet:
      'Use exchange testnet credentials first. Never start with production keys.',
    tooltip_api_key_id:
      'A short label that helps you distinguish local credentials, such as primary or testnet.',
    tooltip_market_order:
      'Market orders simulate execution at the current reference price as soon as the request is accepted.',
    tooltip_limit_order:
      'Limit orders require an explicit price and will simulate against that guarded reference value.',
    tooltip_client_order_id:
      'Optional local identifier for tracing simulation requests and future audit reviews.',
    order_form_title: 'Simulation Order Entry',
    order_form_description:
      'Practice the exact trade flow safely. Phase 3 keeps every execution local and virtual.',
    order_form_badge: 'Simulation-only trading path',
    order_form_reference_price: 'Reference Price',
    order_form_waiting_market: 'Waiting for market feed...',
    order_form_virtual_balance: 'Virtual Balance',
    order_form_estimated_notional: 'Estimated Notional',
    order_form_exchange: 'Exchange',
    order_form_symbol: 'Symbol',
    order_form_side: 'Side',
    order_form_type: 'Type',
    order_form_quantity: 'Quantity',
    order_form_limit_price: 'Limit Price',
    order_form_fallback_price: 'Fallback Reference Price',
    order_form_market_price_placeholder: 'Optional when live price is available',
    order_form_client_order_id: 'Client Order ID',
    order_form_optional: 'optional',
    order_form_simulating: 'Simulating...',
    order_form_submit: 'Simulate Order',
    order_form_success: 'Simulation completed for {symbol} at {price}.',
    order_form_market_option: 'Market',
    order_form_limit_option: 'Limit',
    order_form_buy_option: 'Buy',
    order_form_sell_option: 'Sell',
    order_form_confirm_title: 'Confirm Large Simulation Order',
    order_form_confirm_description:
      'This order exceeds the guarded threshold for your virtual balance. Review the details and type the confirmation phrase before continuing.',
    order_form_confirm_cancel: 'Cancel',
    order_form_confirm_primary: 'Confirm Simulation',
    order_form_summary_title: 'Order Summary',
    order_form_summary_value: 'Estimated value: {value}',
    order_form_confirm_phrase: 'Type {phrase} to continue',

    onboarding_step_welcome_eyebrow: 'Getting Started',
    onboarding_step_welcome_title: 'Welcome',
    onboarding_step_disclaimer_eyebrow: 'Safety First',
    onboarding_step_disclaimer_title: 'Risk Acknowledgment',
    onboarding_step_api_setup_eyebrow: 'Local Key Storage',
    onboarding_step_api_setup_title: 'Testnet Setup',
    onboarding_step_security_eyebrow: 'Launch Readiness',
    onboarding_step_security_title: 'Security Checks',
    onboarding_step_tutorial_eyebrow: 'Recommended Workflow',
    onboarding_step_tutorial_title: 'Quick Tour',
    onboarding_step_complete_eyebrow: 'Next Steps',
    onboarding_step_complete_title: 'Ready To Explore',
    onboarding_wizard_badge: 'Launch-readiness onboarding',
    onboarding_step_counter: 'Step {current} of {total}',
    onboarding_welcome_heading: 'Simulation First. Security Always.',
    onboarding_welcome_body:
      'CryptoDesk AI is designed as a non-custodial desktop co-pilot. You keep control of your credentials locally, practice in simulation, and review AI guidance before any live toggle is ever considered.',
    onboarding_welcome_point_1: 'Renderer stays isolated from Node.js and secret storage.',
    onboarding_welcome_point_2: 'Simulation mode is the default learning path for every new user.',
    onboarding_welcome_point_3: 'AI remains advisory only and never auto-executes in V1.',
    onboarding_disclaimer_heading: 'Practice safely before touching any live workflow',
    onboarding_disclaimer_point_1:
      'Crypto markets are volatile. Use simulation to learn the interface and your process.',
    onboarding_disclaimer_point_2:
      'AI recommendations are explanations, not promises of profit.',
    onboarding_disclaimer_point_3:
      'Live trading remains disabled in this scaffold until credential wiring and runtime audits are complete.',
    onboarding_disclaimer_checkbox: 'I understand the risks of trading and the advisory-only nature of AI.',
    onboarding_api_heading: 'Use testnet credentials and store them locally',
    onboarding_api_body:
      'When you add exchange credentials, they move through the secure preload bridge, get encrypted locally, and are stored in the OS keychain. The renderer never receives the decrypted secret back.',
    onboarding_security_heading: 'Current safety posture',
    onboarding_security_simulation_title: 'Simulation Mode',
    onboarding_security_simulation_ready: 'Enabled and ready.',
    onboarding_security_simulation_warning: 'Should stay enabled for new users.',
    onboarding_security_trading_title: 'Live Trading Toggle',
    onboarding_security_trading_ready: 'Safely disabled.',
    onboarding_security_trading_warning: 'Currently exposed locally.',
    onboarding_security_ai_title: 'AI Auto-Execute',
    onboarding_security_ai_ready: 'Safely disabled for V1.',
    onboarding_security_ai_warning: 'Visible locally, but execution remains hard-blocked.',
    onboarding_tutorial_heading: 'Recommended first session',
    onboarding_tutorial_step_1:
      '1. Visit Dashboard to watch live market updates and AI advisories.',
    onboarding_tutorial_step_2:
      '2. Open Simulation to inspect your virtual balance and trade ledger.',
    onboarding_tutorial_step_3:
      '3. Use Trade to practice order entry with fat-finger protection.',
    onboarding_tutorial_step_4:
      '4. Return to Portfolio and Settings for read-only previews and guardrails.',
    onboarding_complete_heading: 'You are ready to explore the secure workflow',
    onboarding_complete_body:
      'Start with the dashboard for market visibility, then move into simulation to build confidence. Live funds remain protected because real execution is still disabled.',
    onboarding_open_settings: 'Open Settings',
    onboarding_review_security_model: 'Review Security Model',
    onboarding_open_dashboard: 'Open Dashboard',
    onboarding_start_simulation: 'Start In Simulation',
    onboarding_previous: 'Previous',
    onboarding_next: 'Next Step',
    onboarding_finish: 'Finish Onboarding',
    onboarding_skip: 'Skip To Dashboard',

    beta_signup_badge: 'Closed beta preparation',
    beta_signup_title: 'Join The CryptoDesk AI Beta',
    beta_signup_subtitle:
      'Help validate onboarding, simulation workflows, and explainable AI before broader distribution.',
    beta_signup_local_notice:
      'This in-app page is a local intake preview only. Real beta applications should be processed manually until distribution and support channels are ready.',
    beta_signup_benefit_early_title: 'Early Access',
    beta_signup_benefit_early_description:
      'Help shape the first public-facing beta and receive early access to product updates.',
    beta_signup_benefit_product_title: 'Influence The Product',
    beta_signup_benefit_product_description:
      'Your feedback will directly affect onboarding, simulation clarity, and AI transparency priorities.',
    beta_signup_benefit_safety_title: 'Safe Evaluation',
    beta_signup_benefit_safety_description:
      'The current release track is simulation-first and advisory-only, which keeps evaluation safer.',
    beta_signup_form_title: 'Beta application preview',
    beta_signup_form_description:
      'Capture only the details needed to triage applicants and prepare the first cohort responsibly.',
    beta_signup_name_label: 'Name or alias',
    beta_signup_email_label: 'Email',
    beta_signup_discord_label: 'Discord username',
    beta_signup_country_label: 'Country',
    beta_signup_experience_label: 'Trading experience',
    beta_signup_exchange_label: 'Primary exchange',
    beta_signup_other_exchange_label: 'Other exchange',
    beta_signup_os_label: 'Primary device and OS',
    beta_signup_motivation_label: 'Why do you want to join the beta?',
    beta_signup_interests_label: 'Features you want to test first',
    beta_signup_feedback_label: 'Feedback commitment',
    beta_signup_agreements_title: 'Required agreements',
    beta_signup_submit: 'Review Application Draft',
    beta_signup_reset: 'Reset Form',
    beta_signup_submitted_title: 'Application draft captured',
    beta_signup_submitted_description:
      'No data leaves this alpha scaffold. Use the launch docs to manage real applicants manually.',
    beta_signup_validation_error:
      'Complete name, email, country, motivation, at least one feature interest, and all required agreements before continuing.',
    beta_signup_success:
      'The beta application draft is complete. Use the launch documents to review and process applicants manually.',
    beta_signup_selection_title: 'Selection guidance',
    beta_signup_selection_accept_title: 'Accept Immediately',
    beta_signup_selection_accept_description:
      'Prioritize experienced testers who can provide active, structured feedback and understand the simulation-first scope.',
    beta_signup_selection_waitlist_title: 'Waitlist',
    beta_signup_selection_waitlist_description:
      'Hold thoughtful applicants with limited availability or lower experience for a later wave.',
    beta_signup_selection_reject_title: 'Reject This Round',
    beta_signup_selection_reject_description:
      'Decline applicants expecting guaranteed profits, refusing disclaimers, or ignoring product boundaries.',
    beta_signup_faq_title: 'Quick beta FAQ',
    beta_signup_faq_1_q: 'Will this beta execute live trades?',
    beta_signup_faq_1_a:
      'No. The current beta positioning remains simulation-first, and live execution stays intentionally gated.',
    beta_signup_faq_2_q: 'Who is the best fit for the first cohort?',
    beta_signup_faq_2_a:
      'Users who care about security, can describe problems clearly, and will actively share feedback in English or Arabic.',
    beta_signup_faq_3_q: 'Is this form already connected to distribution?',
    beta_signup_faq_3_a:
      'Not yet. This page helps validate the intake workflow locally while external distribution is still being finalized.',
    beta_signup_interest_ai: 'AI signals',
    beta_signup_interest_simulation: 'Simulation mode',
    beta_signup_interest_portfolio: 'Portfolio tracking',
    beta_signup_interest_alerts: 'Real-time alerts',
    beta_signup_interest_multi_exchange: 'Multi-exchange support',
    beta_signup_feedback_active: 'Active: weekly surveys and discussion',
    beta_signup_feedback_passive: 'Passive: bug reports only',
    beta_signup_feedback_observer: 'Observer: occasional feedback',
    beta_signup_experience_beginner: 'Beginner (< 1 year)',
    beta_signup_experience_intermediate: 'Intermediate (1-3 years)',
    beta_signup_experience_advanced: 'Advanced (3+ years)',
    beta_signup_experience_professional: 'Professional',
    beta_signup_exchange_binance: 'Binance',
    beta_signup_exchange_bybit: 'Bybit',
    beta_signup_exchange_coinbase: 'Coinbase',
    beta_signup_exchange_kraken: 'Kraken',
    beta_signup_exchange_other: 'Other',
    beta_signup_os_windows: 'Windows 10/11',
    beta_signup_os_mac_intel: 'macOS (Intel)',
    beta_signup_os_mac_silicon: 'macOS (Apple Silicon)',
    beta_signup_os_linux: 'Linux',
    beta_signup_agreement_beta: 'I understand this is beta software and may contain bugs.',
    beta_signup_agreement_no_advice: 'I understand this product does not provide financial advice.',
    beta_signup_agreement_nda: 'I agree to an NDA if this beta round requires one.',
    beta_signup_agreement_risk: 'I understand the current beta is simulation-first and risk-limited.'
  },
  ar: {
    app_security_boundary_title: 'حدود الأمان',
    app_security_boundary_description:
      'يتم حفظ مفاتيح API محلياً عبر مخزن مفاتيح نظام التشغيل ولا تُعرض مباشرة داخل واجهة العرض.',
    modal_close: 'إغلاق',
    banner_acknowledge_risk:
      'أكمل إقرار المخاطر في صفحة التعريف قبل فتح صفحات التداول الأساسية.',

    sidebar_title: 'المساعد الآمن',
    sidebar_subtitle: 'تداول مكتبي غير وصائي مع حواجز حماية تبدأ بالمحاكاة.',
    sidebar_dashboard_label: 'اللوحة',
    sidebar_dashboard_description: 'نظرة عامة على السوق والذكاء الاصطناعي',
    sidebar_portfolio_label: 'المحفظة',
    sidebar_portfolio_description: 'أرصدة للقراءة فقط وقائمة متابعة',
    sidebar_trade_label: 'التداول',
    sidebar_trade_description: 'إدخال أوامر مع قرار بشري',
    sidebar_simulation_label: 'المحاكاة',
    sidebar_simulation_description: 'ضوابط التداول التجريبي',
    sidebar_settings_label: 'الإعدادات',
    sidebar_settings_description: 'الأمان والتفضيلات',
    sidebar_beta_label: 'برنامج البيتا',
    sidebar_beta_description: 'التسجيل والمعايير والاستعداد للإطلاق',
    sidebar_onboarding_label: 'التهيئة',
    sidebar_onboarding_description: 'مسار إرشادي للمرة الأولى',
    sidebar_security_model: 'نموذج الأمان',

    settings_preferences_title: 'التفضيلات',
    settings_phase5_message: 'الحواجز، اللغة، والاستعداد للإطلاق',
    settings_loading_title: 'مزامنة التفضيلات الآمنة',
    settings_loading_description:
      'يتم تحميل أو حفظ الإعدادات الآمنة الخاصة بالواجهة عبر جسر preload الآمن.',
    settings_language_label: 'اللغة',
    settings_quote_currency_label: 'عملة التسعير',
    settings_simulation_mode_label: 'وضع المحاكاة',
    settings_live_trading_label: 'إظهار مفتاح التداول الحي',
    settings_ai_auto_execute_label: 'إظهار مفتاح التنفيذ التلقائي للذكاء الاصطناعي',
    settings_save_preferences: 'حفظ التفضيلات',
    settings_saving: 'جارٍ الحفظ...',
    settings_api_storage_title: 'تخزين مفاتيح API',
    settings_api_storage_description:
      'تُشفّر المفاتيح محلياً ثم تُحفظ في مخزن مفاتيح نظام التشغيل. التنفيذ الحي ما زال معطلاً في هذا الإصدار الهيكلي.',
    settings_exchange_label: 'البورصة',
    settings_key_id_label: 'معرّف المفتاح',
    settings_secret_label: 'السر',
    settings_store_api_key: 'حفظ مفتاح API',
    settings_language_en: 'English',
    settings_language_ar: 'العربية',

    tooltip_simulation_mode:
      'يُفضّل إبقاء المحاكاة مفعلة أثناء تعلم الواجهة والتحقق من التدفقات بشكل آمن.',
    tooltip_live_trading:
      'هذا المفتاح يغيّر تفضيل الواجهة فقط. التنفيذ الحقيقي ما زال محجوباً في هذا الهيكل.',
    tooltip_ai_auto_execute:
      'التنفيذ التلقائي للذكاء الاصطناعي معطل بشكل صارم في الإصدار الأول حتى لو ظهر هذا الخيار محلياً.',
    tooltip_exchange_testnet:
      'ابدأ دائماً ببيانات testnet الخاصة بالبورصة ولا تستخدم مفاتيح الإنتاج أولاً.',
    tooltip_api_key_id:
      'وصف قصير يساعدك على تمييز بيانات الاعتماد المحلية مثل primary أو testnet.',
    tooltip_market_order:
      'أوامر السوق تُحاكي التنفيذ مباشرة على سعر المرجع الحالي بعد قبول الطلب.',
    tooltip_limit_order:
      'أوامر الحد تتطلب سعراً صريحاً وستُحاكى باستخدام قيمة مرجعية محمية.',
    tooltip_client_order_id:
      'معرّف محلي اختياري لتتبع طلبات المحاكاة ومراجعات التدقيق لاحقاً.',
    order_form_title: 'إدخال أوامر المحاكاة',
    order_form_description:
      'تدرّب على مسار التداول الكامل بأمان. المرحلة الثالثة تُبقي كل تنفيذ محلياً وافتراضياً.',
    order_form_badge: 'مسار تداول للمحاكاة فقط',
    order_form_reference_price: 'السعر المرجعي',
    order_form_waiting_market: 'بانتظار تغذية السوق...',
    order_form_virtual_balance: 'الرصيد الافتراضي',
    order_form_estimated_notional: 'القيمة التقديرية',
    order_form_exchange: 'البورصة',
    order_form_symbol: 'الرمز',
    order_form_side: 'الجانب',
    order_form_type: 'النوع',
    order_form_quantity: 'الكمية',
    order_form_limit_price: 'سعر الحد',
    order_form_fallback_price: 'السعر المرجعي الاحتياطي',
    order_form_market_price_placeholder: 'اختياري عند توفر السعر الحي',
    order_form_client_order_id: 'معرّف الطلب المحلي',
    order_form_optional: 'اختياري',
    order_form_simulating: 'جارٍ تنفيذ المحاكاة...',
    order_form_submit: 'تنفيذ محاكاة الطلب',
    order_form_success: 'اكتملت المحاكاة لـ {symbol} عند {price}.',
    order_form_market_option: 'سوق',
    order_form_limit_option: 'حد',
    order_form_buy_option: 'شراء',
    order_form_sell_option: 'بيع',
    order_form_confirm_title: 'تأكيد طلب محاكاة كبير',
    order_form_confirm_description:
      'هذا الطلب يتجاوز الحد المحمي لرصيدك الافتراضي. راجع التفاصيل واكتب عبارة التأكيد قبل المتابعة.',
    order_form_confirm_cancel: 'إلغاء',
    order_form_confirm_primary: 'تأكيد المحاكاة',
    order_form_summary_title: 'ملخص الطلب',
    order_form_summary_value: 'القيمة التقديرية: {value}',
    order_form_confirm_phrase: 'اكتب {phrase} للمتابعة',

    onboarding_step_welcome_eyebrow: 'البدء',
    onboarding_step_welcome_title: 'مرحباً',
    onboarding_step_disclaimer_eyebrow: 'الأمان أولاً',
    onboarding_step_disclaimer_title: 'إقرار المخاطر',
    onboarding_step_api_setup_eyebrow: 'تخزين محلي للمفاتيح',
    onboarding_step_api_setup_title: 'إعداد testnet',
    onboarding_step_security_eyebrow: 'الاستعداد للإطلاق',
    onboarding_step_security_title: 'فحوصات الأمان',
    onboarding_step_tutorial_eyebrow: 'المسار المقترح',
    onboarding_step_tutorial_title: 'جولة سريعة',
    onboarding_step_complete_eyebrow: 'الخطوات التالية',
    onboarding_step_complete_title: 'أنت جاهز للاستكشاف',
    onboarding_wizard_badge: 'تهيئة جاهزية الإطلاق',
    onboarding_step_counter: 'الخطوة {current} من {total}',
    onboarding_welcome_heading: 'المحاكاة أولاً. الأمان دائماً.',
    onboarding_welcome_body:
      'تم تصميم CryptoDesk AI كمساعد مكتبي غير وصائي. أنت تحتفظ بالتحكم في بيانات الاعتماد محلياً، وتتدرّب في المحاكاة، وتراجع توجيهات الذكاء الاصطناعي قبل التفكير بأي مفتاح حي.',
    onboarding_welcome_point_1: 'الواجهة معزولة بالكامل عن Node.js وتخزين الأسرار.',
    onboarding_welcome_point_2: 'وضع المحاكاة هو مسار التعلم الافتراضي لكل مستخدم جديد.',
    onboarding_welcome_point_3: 'الذكاء الاصطناعي استشاري فقط ولا ينفذ تلقائياً في الإصدار الأول.',
    onboarding_disclaimer_heading: 'تدرّب بأمان قبل لمس أي مسار حي',
    onboarding_disclaimer_point_1:
      'أسواق العملات الرقمية متقلبة. استخدم المحاكاة لتتعلم الواجهة وطريقتك في العمل.',
    onboarding_disclaimer_point_2:
      'توصيات الذكاء الاصطناعي تفسيرات وليست وعوداً بالربح.',
    onboarding_disclaimer_point_3:
      'التداول الحي ما زال معطلاً في هذا الهيكل حتى يكتمل ربط الاعتماديات وفحوصات التشغيل.',
    onboarding_disclaimer_checkbox:
      'أفهم مخاطر التداول وأن الذكاء الاصطناعي هنا استشاري فقط.',
    onboarding_api_heading: 'استخدم بيانات testnet وخزّنها محلياً',
    onboarding_api_body:
      'عند إضافة بيانات اعتماد البورصة فإنها تمر عبر جسر preload الآمن، وتُشفّر محلياً، ثم تُحفظ في مخزن مفاتيح النظام. الواجهة لا تستقبل السر المفكوك أبداً.',
    onboarding_security_heading: 'الوضع الأمني الحالي',
    onboarding_security_simulation_title: 'وضع المحاكاة',
    onboarding_security_simulation_ready: 'مفعّل وجاهز.',
    onboarding_security_simulation_warning: 'يجب إبقاؤه مفعلاً للمستخدمين الجدد.',
    onboarding_security_trading_title: 'مفتاح التداول الحي',
    onboarding_security_trading_ready: 'معطل بأمان.',
    onboarding_security_trading_warning: 'ظاهر محلياً حالياً.',
    onboarding_security_ai_title: 'التنفيذ التلقائي للذكاء الاصطناعي',
    onboarding_security_ai_ready: 'معطل بأمان في الإصدار الأول.',
    onboarding_security_ai_warning: 'ظاهر محلياً لكن التنفيذ ما زال محجوباً بالكامل.',
    onboarding_tutorial_heading: 'الجلسة الأولى المقترحة',
    onboarding_tutorial_step_1:
      '1. ابدأ من اللوحة لمتابعة السوق والتنبيهات التفسيرية للذكاء الاصطناعي.',
    onboarding_tutorial_step_2:
      '2. افتح المحاكاة لمراجعة الرصيد الافتراضي وسجل الصفقات.',
    onboarding_tutorial_step_3:
      '3. استخدم صفحة التداول للتدرّب على إدخال الأوامر مع حماية الأخطاء الكبيرة.',
    onboarding_tutorial_step_4:
      '4. ارجع إلى المحفظة والإعدادات لمعاينات القراءة فقط وحواجز الأمان.',
    onboarding_complete_heading: 'أنت جاهز لاستكشاف المسار الآمن',
    onboarding_complete_body:
      'ابدأ من اللوحة لرؤية السوق، ثم انتقل إلى المحاكاة لبناء الثقة. أموالك الحقيقية تبقى محمية لأن التنفيذ الحقيقي ما زال معطلاً.',
    onboarding_open_settings: 'افتح الإعدادات',
    onboarding_review_security_model: 'راجع نموذج الأمان',
    onboarding_open_dashboard: 'افتح اللوحة',
    onboarding_start_simulation: 'ابدأ بالمحاكاة',
    onboarding_previous: 'السابق',
    onboarding_next: 'الخطوة التالية',
    onboarding_finish: 'إنهاء التهيئة',
    onboarding_skip: 'الانتقال إلى اللوحة',

    beta_signup_badge: 'الاستعداد للبيتا المغلقة',
    beta_signup_title: 'انضم إلى بيتا CryptoDesk AI',
    beta_signup_subtitle:
      'ساعدنا في التحقق من التهيئة وتدفقات المحاكاة وتوصيات الذكاء الاصطناعي القابلة للتفسير قبل التوزيع الأوسع.',
    beta_signup_local_notice:
      'هذه الصفحة معاينة محلية لنظام التسجيل فقط. تتم مراجعة طلبات البيتا يدوياً حتى تكتمل قنوات التوزيع والدعم.',
    beta_signup_benefit_early_title: 'وصول مبكر',
    beta_signup_benefit_early_description:
      'ساهم في تشكيل أول بيتا موجهة للمستخدمين واحصل على وصول مبكر لتحديثات المنتج.',
    beta_signup_benefit_product_title: 'أثر في المنتج',
    beta_signup_benefit_product_description:
      'تؤثر ملاحظاتك مباشرة في أولويات التهيئة ووضوح المحاكاة وشفافية الذكاء الاصطناعي.',
    beta_signup_benefit_safety_title: 'تقييم آمن',
    beta_signup_benefit_safety_description:
      'المسار الحالي يعتمد على المحاكاة والتوصيات الاستشارية فقط، مما يجعل التقييم أكثر أماناً.',
    beta_signup_form_title: 'معاينة طلب البيتا',
    beta_signup_form_description:
      'اجمع فقط البيانات اللازمة لفرز المتقدمين وتجهيز أول دفعة بشكل مسؤول.',
    beta_signup_name_label: 'الاسم أو المعرّف',
    beta_signup_email_label: 'البريد الإلكتروني',
    beta_signup_discord_label: 'اسم مستخدم Discord',
    beta_signup_country_label: 'البلد',
    beta_signup_experience_label: 'خبرة التداول',
    beta_signup_exchange_label: 'البورصة الرئيسية',
    beta_signup_other_exchange_label: 'بورصة أخرى',
    beta_signup_os_label: 'الجهاز ونظام التشغيل الرئيسي',
    beta_signup_motivation_label: 'لماذا تريد الانضمام إلى البيتا؟',
    beta_signup_interests_label: 'الميزات التي تريد اختبارها أولاً',
    beta_signup_feedback_label: 'مستوى الالتزام بالتغذية الراجعة',
    beta_signup_agreements_title: 'الموافقات المطلوبة',
    beta_signup_submit: 'مراجعة مسودة الطلب',
    beta_signup_reset: 'إعادة ضبط النموذج',
    beta_signup_submitted_title: 'تم تجهيز مسودة الطلب',
    beta_signup_submitted_description:
      'لا تغادر أي بيانات هذا الإصدار الأولي. استخدم وثائق الإطلاق لمعالجة المتقدمين يدوياً.',
    beta_signup_validation_error:
      'أكمل الاسم والبريد والبلد والدافع وميزة واحدة على الأقل وجميع الموافقات المطلوبة قبل المتابعة.',
    beta_signup_success:
      'اكتملت مسودة طلب البيتا. استخدم وثائق الإطلاق لمراجعة المتقدمين ومعالجتهم يدوياً.',
    beta_signup_selection_title: 'إرشادات الاختيار',
    beta_signup_selection_accept_title: 'القبول الفوري',
    beta_signup_selection_accept_description:
      'أعط الأولوية للمختبرين ذوي الخبرة القادرين على تقديم ملاحظات نشطة ومنظمة ويفهمون أن الإطلاق يبدأ بالمحاكاة.',
    beta_signup_selection_waitlist_title: 'قائمة الانتظار',
    beta_signup_selection_waitlist_description:
      'احتفظ بالمتقدمين الجيدين ذوي التفرغ المحدود أو الخبرة الأقل لجولة لاحقة.',
    beta_signup_selection_reject_title: 'الرفض في هذه الجولة',
    beta_signup_selection_reject_description:
      'ارفض المتقدمين الذين يتوقعون أرباحاً مضمونة أو يرفضون التنبيهات أو يتجاهلون حدود المنتج.',
    beta_signup_faq_title: 'أسئلة سريعة حول البيتا',
    beta_signup_faq_1_q: 'هل ستنفذ هذه البيتا صفقات حية؟',
    beta_signup_faq_1_a:
      'لا. التموضع الحالي للبيتا يعتمد على المحاكاة أولاً والتنفيذ الحي ما زال محجوباً عمداً.',
    beta_signup_faq_2_q: 'من الأنسب للدفعة الأولى؟',
    beta_signup_faq_2_a:
      'المستخدمون الذين يهتمون بالأمان ويستطيعون وصف المشكلات بوضوح وسيقدمون ملاحظات نشطة بالعربية أو الإنجليزية.',
    beta_signup_faq_3_q: 'هل هذا النموذج مرتبط بالتوزيع الفعلي بالفعل؟',
    beta_signup_faq_3_a:
      'ليس بعد. تساعد هذه الصفحة في اختبار مسار التسجيل محلياً الآن بينما ما زال التوزيع الخارجي قيد الإنهاء.',
    beta_signup_interest_ai: 'إشارات الذكاء الاصطناعي',
    beta_signup_interest_simulation: 'وضع المحاكاة',
    beta_signup_interest_portfolio: 'تتبع المحفظة',
    beta_signup_interest_alerts: 'التنبيهات الحية',
    beta_signup_interest_multi_exchange: 'دعم أكثر من بورصة',
    beta_signup_feedback_active: 'نشط: استبيانات أسبوعية ونقاشات',
    beta_signup_feedback_passive: 'سلبي: تقارير أخطاء فقط',
    beta_signup_feedback_observer: 'مراقب: ملاحظات متقطعة',
    beta_signup_experience_beginner: 'مبتدئ (< سنة)',
    beta_signup_experience_intermediate: 'متوسط (1-3 سنوات)',
    beta_signup_experience_advanced: 'متقدم (3+ سنوات)',
    beta_signup_experience_professional: 'احترافي',
    beta_signup_exchange_binance: 'Binance',
    beta_signup_exchange_bybit: 'Bybit',
    beta_signup_exchange_coinbase: 'Coinbase',
    beta_signup_exchange_kraken: 'Kraken',
    beta_signup_exchange_other: 'أخرى',
    beta_signup_os_windows: 'Windows 10/11',
    beta_signup_os_mac_intel: 'macOS (Intel)',
    beta_signup_os_mac_silicon: 'macOS (Apple Silicon)',
    beta_signup_os_linux: 'Linux',
    beta_signup_agreement_beta: 'أفهم أن هذا برنامج بيتا وقد يحتوي على أخطاء.',
    beta_signup_agreement_no_advice: 'أفهم أن هذا المنتج لا يقدم نصيحة مالية.',
    beta_signup_agreement_nda: 'أوافق على اتفاقية عدم إفشاء إذا اقتضت هذه الجولة ذلك.',
    beta_signup_agreement_risk: 'أفهم أن البيتا الحالية تعتمد على المحاكاة أولاً ومحدودة المخاطر.'
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

type InterpolationValues = Readonly<Record<string, string | number>>;

const normalizeLocale = (locale?: string): string => {
  return typeof locale === 'string' && locale.trim().length > 0
    ? locale.trim().toLowerCase()
    : 'en';
};

export const getLanguageFromLocale = (locale?: string): Language => {
  return normalizeLocale(locale).startsWith('ar') ? 'ar' : 'en';
};

export const isRtlLanguage = (language: Language): boolean => {
  return language === 'ar';
};

export const getDirectionFromLocale = (locale?: string): 'ltr' | 'rtl' => {
  return isRtlLanguage(getLanguageFromLocale(locale)) ? 'rtl' : 'ltr';
};

const interpolate = (template: string, values?: InterpolationValues): string => {
  if (values === undefined) {
    return template;
  }

  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, template);
};

export const t = (
  key: TranslationKey,
  locale?: string,
  values?: InterpolationValues
): string => {
  const language = getLanguageFromLocale(locale);
  return interpolate(translations[language][key] ?? translations.en[key], values);
};
