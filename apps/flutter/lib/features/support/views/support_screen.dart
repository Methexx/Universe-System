import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_colors.dart';

// ─── Models ───────────────────────────────────────────────────────────────────

enum _SupportType { complaint, suggestion }

class _SupportItem {
  const _SupportItem({
    required this.type,
    required this.tag,
    required this.tagColor,
    required this.title,
    required this.body,
    required this.date,
  });
  final _SupportType type;
  final String tag;
  final Color tagColor;
  final String title;
  final String body;
  final String date;
}

const List<_SupportItem> _kItems = <_SupportItem>[
  _SupportItem(
    type: _SupportType.complaint,
    tag: 'ADMIN',
    tagColor: Color(0xFF1A3A44),
    title: 'Chemistry Curriculum Feedback',
    body: 'The latest practical assignments seem a bit advanced for Grade 8. Suggesting a review of the difficulty level before the next semester.',
    date: 'Oct 12, 2023',
  ),
  _SupportItem(
    type: _SupportType.complaint,
    tag: 'TEACHER',
    tagColor: Color(0xFF2E6B7F),
    title: 'Classroom Projector Issue',
    body: 'The projector in Room 204 has been flickering during lessons. It disrupts the class and needs urgent maintenance.',
    date: 'Oct 18, 2023',
  ),
  _SupportItem(
    type: _SupportType.suggestion,
    tag: 'ADMIN',
    tagColor: Color(0xFF1A3A44),
    title: 'Library AC Malfunction',
    body: 'The air conditioning in the north wing of the library has been making a loud noise for three days.',
    date: 'Oct 14, 2023',
  ),
  _SupportItem(
    type: _SupportType.suggestion,
    tag: 'TEACHER',
    tagColor: Color(0xFF2E6B7F),
    title: 'Add More Study Rooms',
    body: 'Students would benefit greatly from additional quiet study spaces, especially during exam season.',
    date: 'Oct 20, 2023',
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entryController;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;

  _SupportType _activeTab = _SupportType.complaint;

  @override
  void initState() {
    super.initState();
    _entryController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _entryController, curve: Curves.easeOutCubic));
    _fadeAnim = CurvedAnimation(parent: _entryController, curve: Curves.easeOut);
    _entryController.forward();
  }

  @override
  void dispose() {
    _entryController.dispose();
    super.dispose();
  }

  List<_SupportItem> get _filtered =>
      _kItems.where((i) => i.type == _activeTab).toList();

  void _switchTab(_SupportType tab) {
    if (_activeTab == tab) return;
    setState(() => _activeTab = tab);
    _entryController.forward(from: 0);
  }

  @override
  Widget build(BuildContext context) {
    final double topInset = MediaQuery.paddingOf(context).top;
    final double bottomInset = MediaQuery.paddingOf(context).bottom;

    return Scaffold(
      backgroundColor: const Color(0xFFF4FAFB),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // ── Header ───────────────────────────────────────────────────────
          Container(
            color: AppColors.primary,
            padding: EdgeInsets.fromLTRB(20, topInset + 16, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                // Back button
                GestureDetector(
                  onTap: () => context.pop(),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.arrow_back_ios_new_rounded,
                      size: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Support',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'How can we help you today?',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withValues(alpha: 0.65),
                  ),
                ),
                const SizedBox(height: 20),
                // ── Tab switcher ─────────────────────────────────────────
                _TabSwitcher(
                  active: _activeTab,
                  onChanged: _switchTab,
                ),
              ],
            ),
          ),

          // ── List ─────────────────────────────────────────────────────────
          Expanded(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: ListView.separated(
                  padding: EdgeInsets.fromLTRB(16, 20, 16, bottomInset + 100),
                  itemCount: _filtered.length,
                  separatorBuilder: (BuildContext c, int idx) => const SizedBox(height: 14),
                  itemBuilder: (BuildContext ctx, int i) =>
                      _SupportCard(item: _filtered[i]),
                ),
              ),
            ),
          ),
        ],
      ),

      // ── FAB ──────────────────────────────────────────────────────────────
      floatingActionButton: Padding(
        padding: EdgeInsets.only(bottom: bottomInset > 0 ? 0 : 8),
        child: SizedBox(
          width: double.infinity,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: _SubmitButton(activeTab: _activeTab),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

// ─── Tab switcher ─────────────────────────────────────────────────────────────

class _TabSwitcher extends StatelessWidget {
  const _TabSwitcher({required this.active, required this.onChanged});
  final _SupportType active;
  final ValueChanged<_SupportType> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 44,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(14),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: <Widget>[
          _Tab(
            label: 'Complaints',
            isActive: active == _SupportType.complaint,
            onTap: () => onChanged(_SupportType.complaint),
          ),
          _Tab(
            label: 'Suggestions',
            isActive: active == _SupportType.suggestion,
            onTap: () => onChanged(_SupportType.suggestion),
          ),
        ],
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({required this.label, required this.isActive, required this.onTap});
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isActive
                ? <BoxShadow>[
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.10),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isActive ? AppColors.primary : Colors.white.withValues(alpha: 0.75),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Support card ─────────────────────────────────────────────────────────────

class _SupportCard extends StatelessWidget {
  const _SupportCard({required this.item});
  final _SupportItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // Tag chip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: item.tagColor.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              item.tag,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: item.tagColor,
                letterSpacing: 0.6,
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Title
          Text(
            item.title,
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: Color(0xFF16212A),
            ),
          ),
          const SizedBox(height: 6),
          // Body preview
          Text(
            item.body,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 13,
              fontWeight: FontWeight.w400,
              color: Color(0xFF5A7A85),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 14),
          // Divider
          Container(height: 1, color: const Color(0xFFEBF3F6)),
          const SizedBox(height: 12),
          // Footer
          Row(
            children: <Widget>[
              Text(
                'Submitted on ${item.date}',
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF94A3B0),
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {},
                child: Row(
                  children: <Widget>[
                    Text(
                      'View Details',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 2),
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 11,
                      color: AppColors.primary,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Submit button ────────────────────────────────────────────────────────────

class _SubmitButton extends StatelessWidget {
  const _SubmitButton({required this.activeTab});
  final _SupportType activeTab;

  @override
  Widget build(BuildContext context) {
    final String label = activeTab == _SupportType.complaint
        ? 'Submit New Complaint'
        : 'Submit New Suggestion';

    return GestureDetector(
      onTap: () {},
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1A3A44), Color(0xFF2E6B7F)],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: const Color(0xFF1A3A44).withValues(alpha: 0.35),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Icon(Icons.add_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
