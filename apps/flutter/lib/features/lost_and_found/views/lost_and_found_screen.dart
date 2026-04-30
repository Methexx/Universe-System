import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

// ─── Role ─────────────────────────────────────────────────────────────────────

enum _Role { teacher, parent, admin }

extension _RoleLabel on _Role {
  String get label {
    switch (this) {
      case _Role.teacher:
        return 'TEACHER';
      case _Role.parent:
        return 'PARENT';
      case _Role.admin:
        return 'ADMIN';
    }
  }

  Color get color {
    switch (this) {
      case _Role.teacher:
        return const Color(0xFF2E6B7F);
      case _Role.parent:
        return const Color(0xFF7A3D1A);
      case _Role.admin:
        return const Color(0xFF1A3A44);
    }
  }

  Color get bgColor => color.withValues(alpha: 0.10);

  IconData get icon {
    switch (this) {
      case _Role.teacher:
        return Icons.school_rounded;
      case _Role.parent:
        return Icons.family_restroom_rounded;
      case _Role.admin:
        return Icons.admin_panel_settings_rounded;
    }
  }
}

// ─── Status ───────────────────────────────────────────────────────────────────

enum _Status { open, found, closed }

extension _StatusLabel on _Status {
  String get label {
    switch (this) {
      case _Status.open:
        return 'Open';
      case _Status.found:
        return 'Found';
      case _Status.closed:
        return 'Closed';
    }
  }

  Color get color {
    switch (this) {
      case _Status.open:
        return const Color(0xFFE8845A);
      case _Status.found:
        return const Color(0xFF16A34A);
      case _Status.closed:
        return const Color(0xFF94A3B0);
    }
  }

  Color get bgColor => color.withValues(alpha: 0.12);
}

// ─── Comment model ────────────────────────────────────────────────────────────

class _Comment {
  _Comment({
    required this.authorName,
    required this.role,
    required this.classOrDept,
    required this.text,
    required this.timeAgo,
  });
  final String authorName;
  final _Role role;
  final String classOrDept;
  final String text;
  final String timeAgo;
}

// ─── Post model ───────────────────────────────────────────────────────────────

class _Post {
  _Post({
    required this.id,
    required this.authorName,
    required this.role,
    required this.classOrDept,
    required this.title,
    required this.description,
    required this.location,
    required this.timeAgo,
    required this.status,
    required this.comments,
  });
  final String id;
  final String authorName;
  final _Role role;
  final String classOrDept;
  final String title;
  final String description;
  final String location;
  final String timeAgo;
  _Status status;
  final List<_Comment> comments;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

List<_Post> _kPosts = <_Post>[
  _Post(
    id: '1',
    authorName: 'Mrs. Silva',
    role: _Role.teacher,
    classOrDept: 'Grade 8 · Mathematics',
    title: 'Blue Water Bottle Found',
    description:
        'Found a blue Nike water bottle near the science lab entrance. Has initials "A.P." written on the bottom. Please contact me to collect.',
    location: 'Science Lab – Block B',
    timeAgo: '10 min ago',
    status: _Status.open,
    comments: <_Comment>[
      _Comment(
        authorName: 'Mr. Perera',
        role: _Role.admin,
        classOrDept: 'Administration',
        text: 'Posted to the notice board as well. Please collect by Friday.',
        timeAgo: '8 min ago',
      ),
    ],
  ),
  _Post(
    id: '2',
    authorName: 'Priya Jayawardena',
    role: _Role.parent,
    classOrDept: 'Parent · Grade 6C',
    title: 'Lost – Grey School Bag',
    description:
        'My son Ashan lost his grey Adidas school bag last Tuesday. It contains his science notebook and a pencil case. If anyone finds it, please hand it to the office.',
    location: 'Canteen / Playground Area',
    timeAgo: '2 hrs ago',
    status: _Status.open,
    comments: <_Comment>[
      _Comment(
        authorName: 'Mrs. Wijesinghe',
        role: _Role.teacher,
        classOrDept: 'Grade 6C · ICT',
        text: 'I will check the classroom and lost property box tomorrow morning.',
        timeAgo: '1 hr ago',
      ),
      _Comment(
        authorName: 'Mr. Bandara',
        role: _Role.admin,
        classOrDept: 'Administration',
        text: 'A grey bag was submitted to the office yesterday. Please come and verify.',
        timeAgo: '30 min ago',
      ),
    ],
  ),
  _Post(
    id: '3',
    authorName: 'Mr. Bandara',
    role: _Role.admin,
    classOrDept: 'Administration',
    title: 'Set of Keys Found in Library',
    description:
        'A set of keys with a red keychain was found in the library reading room. Handed to the main office. Owner can collect from the front desk with ID.',
    location: 'Main Office – Front Desk',
    timeAgo: 'Yesterday',
    status: _Status.found,
    comments: <_Comment>[],
  ),
  _Post(
    id: '4',
    authorName: 'Nimal Fernando',
    role: _Role.parent,
    classOrDept: 'Parent · Grade 9A',
    title: 'Lost – Spectacles Case',
    description:
        'My daughter Amaya lost her spectacles case (black, hard cover) somewhere on school grounds last Friday. The glasses are inside — she needs them urgently.',
    location: 'Unknown',
    timeAgo: '3 days ago',
    status: _Status.closed,
    comments: <_Comment>[
      _Comment(
        authorName: 'Mrs. Silva',
        role: _Role.teacher,
        classOrDept: 'Grade 9A · Mathematics',
        text: 'Found and returned to Amaya this morning.',
        timeAgo: '2 days ago',
      ),
    ],
  ),
];

// ─── Screen ───────────────────────────────────────────────────────────────────

class LostAndFoundScreen extends StatefulWidget {
  const LostAndFoundScreen({super.key});

  @override
  State<LostAndFoundScreen> createState() => _LostAndFoundScreenState();
}

class _LostAndFoundScreenState extends State<LostAndFoundScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entryController;
  late final Animation<Offset> _slideAnim;
  late final Animation<double> _fadeAnim;

  _Status? _filter; // null = all

  @override
  void initState() {
    super.initState();
    _entryController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.08),
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

  List<_Post> get _filtered => _filter == null
      ? _kPosts
      : _kPosts.where((p) => p.status == _filter).toList();

  void _setFilter(_Status? f) {
    if (_filter == f) return;
    setState(() => _filter = f);
    _entryController.forward(from: 0);
  }

  void _openNewPost() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _NewPostSheet(
        onSubmit: (post) {
          setState(() => _kPosts.insert(0, post));
        },
      ),
    );
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
            width: double.infinity,
            color: const Color(0xFF7A3D1A),
            padding: EdgeInsets.fromLTRB(20, topInset + 16, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
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
                  'Lost & Found',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Community board — post what you lost or found',
                  style: TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withValues(alpha: 0.65),
                  ),
                ),
                const SizedBox(height: 18),
                // ── Filter chips ─────────────────────────────────────────
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: <Widget>[
                      _FilterChip(
                        label: 'All',
                        isActive: _filter == null,
                        onTap: () => _setFilter(null),
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Open',
                        isActive: _filter == _Status.open,
                        onTap: () => _setFilter(_Status.open),
                        dotColor: _Status.open.color,
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Found',
                        isActive: _filter == _Status.found,
                        onTap: () => _setFilter(_Status.found),
                        dotColor: _Status.found.color,
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Closed',
                        isActive: _filter == _Status.closed,
                        onTap: () => _setFilter(_Status.closed),
                        dotColor: _Status.closed.color,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Thread list ──────────────────────────────────────────────────
          Expanded(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: SlideTransition(
                position: _slideAnim,
                child: _filtered.isEmpty
                    ? const Center(
                        child: Text(
                          'No posts yet.',
                          style: TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 14,
                            color: Color(0xFF94A3B0),
                          ),
                        ),
                      )
                    : ListView.separated(
                        padding: EdgeInsets.fromLTRB(16, 20, 16, bottomInset + 100),
                        itemCount: _filtered.length,
                        separatorBuilder: (context, index) =>
                            const SizedBox(height: 16),
                        itemBuilder: (ctx, i) => _PostCard(
                          post: _filtered[i],
                          onStatusChanged: (s) =>
                              setState(() => _filtered[i].status = s),
                        ),
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
            child: GestureDetector(
              onTap: _openNewPost,
              child: Container(
                height: 52,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: <Color>[Color(0xFF7A3D1A), Color(0xFFD47A2E)],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: <BoxShadow>[
                    BoxShadow(
                      color: const Color(0xFF7A3D1A).withValues(alpha: 0.35),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Icon(Icons.add_rounded, color: Colors.white, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Post Lost or Found',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.isActive,
    required this.onTap,
    this.dotColor,
  });
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final Color? dotColor;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.white.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            if (dotColor != null) ...<Widget>[
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  color: isActive ? dotColor : Colors.white.withValues(alpha: 0.7),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 5),
            ],
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: isActive
                    ? const Color(0xFF7A3D1A)
                    : Colors.white.withValues(alpha: 0.85),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Post card ────────────────────────────────────────────────────────────────

class _PostCard extends StatefulWidget {
  const _PostCard({required this.post, required this.onStatusChanged});
  final _Post post;
  final ValueChanged<_Status> onStatusChanged;

  @override
  State<_PostCard> createState() => _PostCardState();
}

class _PostCardState extends State<_PostCard> {
  bool _expanded = false;
  final TextEditingController _commentCtrl = TextEditingController();

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  void _addComment() {
    final String text = _commentCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() {
      widget.post.comments.add(
        _Comment(
          authorName: 'You',
          role: _Role.parent,
          classOrDept: 'Parent · Grade 8C',
          text: text,
          timeAgo: 'Just now',
        ),
      );
    });
    _commentCtrl.clear();
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final _Post p = widget.post;
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // ── Card body ────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                // Author row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    // Avatar
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: p.role.color.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(p.role.icon, size: 20, color: p.role.color),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            p.authorName,
                            style: const TextStyle(
                              fontFamily: 'Plus Jakarta Sans',
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF16212A),
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            p.classOrDept,
                            style: const TextStyle(
                              fontFamily: 'Plus Jakarta Sans',
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF94A3B0),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Role badge + time
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: <Widget>[
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: p.role.bgColor,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            p.role.label,
                            style: TextStyle(
                              fontFamily: 'Plus Jakarta Sans',
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: p.role.color,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          p.timeAgo,
                          style: const TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF94A3B0),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Title + status
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        p.title,
                        style: const TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF16212A),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 9, vertical: 4),
                      decoration: BoxDecoration(
                        color: p.status.bgColor,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        p.status.label,
                        style: TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: p.status.color,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                // Description
                Text(
                  p.description,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    color: Color(0xFF5A7A85),
                    height: 1.55,
                  ),
                ),

                const SizedBox(height: 10),

                // Location chip
                Row(
                  children: <Widget>[
                    Icon(
                      Icons.location_on_rounded,
                      size: 13,
                      color: const Color(0xFFD47A2E),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      p.location,
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFD47A2E),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),
                Container(height: 1, color: const Color(0xFFEBF3F6)),
                const SizedBox(height: 12),

                // Footer: comments count + expand toggle
                Row(
                  children: <Widget>[
                    Icon(
                      Icons.chat_bubble_outline_rounded,
                      size: 14,
                      color: const Color(0xFF94A3B0),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      '${p.comments.length} comment${p.comments.length == 1 ? '' : 's'}',
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF94A3B0),
                      ),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: () => setState(() => _expanded = !_expanded),
                      child: Row(
                        children: <Widget>[
                          Text(
                            _expanded ? 'Hide' : 'View Thread',
                            style: const TextStyle(
                              fontFamily: 'Plus Jakarta Sans',
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF7A3D1A),
                            ),
                          ),
                          const SizedBox(width: 2),
                          Icon(
                            _expanded
                                ? Icons.keyboard_arrow_up_rounded
                                : Icons.keyboard_arrow_down_rounded,
                            size: 16,
                            color: const Color(0xFF7A3D1A),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // ── Thread (expandable) ──────────────────────────────────────
          if (_expanded) ...<Widget>[
            Container(height: 1, color: const Color(0xFFF0F5F7)),
            // Existing comments
            if (p.comments.isNotEmpty)
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                itemCount: p.comments.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 10),
                itemBuilder: (ctx, i) =>
                    _CommentTile(comment: p.comments[i]),
              ),
            const SizedBox(height: 12),
            // Comment input
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: Container(
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF4FAFB),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFDDE8ED)),
                      ),
                      child: TextField(
                        controller: _commentCtrl,
                        style: const TextStyle(
                          fontFamily: 'Plus Jakarta Sans',
                          fontSize: 13,
                          color: Color(0xFF16212A),
                        ),
                        decoration: const InputDecoration(
                          hintText: 'Add a comment…',
                          hintStyle: TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 13,
                            color: Color(0xFF94A3B0),
                          ),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                        ),
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _addComment(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _addComment,
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: <Color>[
                            Color(0xFF7A3D1A),
                            Color(0xFFD47A2E),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.send_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Comment tile ─────────────────────────────────────────────────────────────

class _CommentTile extends StatelessWidget {
  const _CommentTile({required this.comment});
  final _Comment comment;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: comment.role.color.withValues(alpha: 0.10),
            shape: BoxShape.circle,
          ),
          child: Icon(comment.role.icon, size: 16, color: comment.role.color),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  Text(
                    comment.authorName,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF16212A),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: comment.role.bgColor,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: Text(
                      comment.role.label,
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 8,
                        fontWeight: FontWeight.w800,
                        color: comment.role.color,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    comment.timeAgo,
                    style: const TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 10,
                      color: Color(0xFF94A3B0),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              Text(
                comment.classOrDept,
                style: const TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF94A3B0),
                ),
              ),
              const SizedBox(height: 5),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF4FAFB),
                  borderRadius: const BorderRadius.only(
                    topRight: Radius.circular(12),
                    bottomLeft: Radius.circular(12),
                    bottomRight: Radius.circular(12),
                  ),
                ),
                child: Text(
                  comment.text,
                  style: const TextStyle(
                    fontFamily: 'Plus Jakarta Sans',
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    color: Color(0xFF4A6572),
                    height: 1.5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ─── New post bottom sheet ────────────────────────────────────────────────────

class _NewPostSheet extends StatefulWidget {
  const _NewPostSheet({required this.onSubmit});
  final ValueChanged<_Post> onSubmit;

  @override
  State<_NewPostSheet> createState() => _NewPostSheetState();
}

class _NewPostSheetState extends State<_NewPostSheet> {
  final TextEditingController _titleCtrl = TextEditingController();
  final TextEditingController _descCtrl = TextEditingController();
  final TextEditingController _locationCtrl = TextEditingController();
  _Role _selectedRole = _Role.parent;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _locationCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    if (_titleCtrl.text.trim().isEmpty || _descCtrl.text.trim().isEmpty) return;
    final String classOrDept = switch (_selectedRole) {
      _Role.teacher => 'Grade 8 · Class Teacher',
      _Role.parent => 'Parent · Grade 8C',
      _Role.admin => 'Administration',
    };
    final _Post post = _Post(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      authorName: 'You',
      role: _selectedRole,
      classOrDept: classOrDept,
      title: _titleCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      location: _locationCtrl.text.trim().isEmpty
          ? 'Unknown'
          : _locationCtrl.text.trim(),
      timeAgo: 'Just now',
      status: _Status.open,
      comments: <_Comment>[],
    );
    widget.onSubmit(post);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final double bottomInset = MediaQuery.viewInsetsOf(context).bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, bottomInset + 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            // Handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFE0E0E0),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'New Post',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Color(0xFF16212A),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Let the community know what you lost or found',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                color: Color(0xFF94A3B0),
              ),
            ),
            const SizedBox(height: 20),

            // Posted as (role)
            const Text(
              'Posting as',
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Color(0xFF4A6572),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: _Role.values
                  .map(
                    (r) => Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedRole = r),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: _selectedRole == r
                                ? r.color
                                : r.color.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            r.label,
                            style: TextStyle(
                              fontFamily: 'Plus Jakarta Sans',
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: _selectedRole == r
                                  ? Colors.white
                                  : r.color,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),

            const SizedBox(height: 18),
            _FormField(
              controller: _titleCtrl,
              label: 'Title',
              hint: 'e.g. Blue water bottle found near library',
            ),
            const SizedBox(height: 12),
            _FormField(
              controller: _descCtrl,
              label: 'Description',
              hint: 'Describe the item and any identifying details…',
              maxLines: 3,
            ),
            const SizedBox(height: 12),
            _FormField(
              controller: _locationCtrl,
              label: 'Location (optional)',
              hint: 'e.g. Canteen, Science Lab, Main Gate',
            ),
            const SizedBox(height: 24),

            // Submit
            GestureDetector(
              onTap: _submit,
              child: Container(
                height: 52,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: <Color>[Color(0xFF7A3D1A), Color(0xFFD47A2E)],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: <BoxShadow>[
                    BoxShadow(
                      color: const Color(0xFF7A3D1A).withValues(alpha: 0.30),
                      blurRadius: 14,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: const Center(
                  child: Text(
                    'Post to Thread',
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FormField extends StatelessWidget {
  const _FormField({
    required this.controller,
    required this.label,
    required this.hint,
    this.maxLines = 1,
  });
  final TextEditingController controller;
  final String label;
  final String hint;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          label,
          style: const TextStyle(
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Color(0xFF4A6572),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF4FAFB),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFDDE8ED)),
          ),
          child: TextField(
            controller: controller,
            maxLines: maxLines,
            style: const TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 13,
              color: Color(0xFF16212A),
            ),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                color: Color(0xFF94A3B0),
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14, vertical: 12),
            ),
          ),
        ),
      ],
    );
  }
}
