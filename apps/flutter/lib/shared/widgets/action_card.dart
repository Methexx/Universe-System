import 'dart:math' as math;
import 'package:flutter/material.dart';

// ─── Bubble definition ────────────────────────────────────────────────────────

class _BubbleDef {
  const _BubbleDef({
    required this.size,
    required this.dx,
    required this.dy,
    required this.phaseOffset,
    required this.xAmplitude,
    required this.yAmplitude,
    required this.opacity,
  });
  final double size;
  final double dx;   // 0..1 fractional position within card
  final double dy;   // 0..1 fractional position within card
  final double phaseOffset;
  final double xAmplitude; // px drift
  final double yAmplitude;
  final double opacity;
}

// Each card gets its own unique bubble layout
const List<List<_BubbleDef>> _kCardBubbles = <List<_BubbleDef>>[
  // Card 0 – Gate In/Out
  <_BubbleDef>[
    _BubbleDef(size: 70, dx: 0.85, dy: 0.10, phaseOffset: 0.00, xAmplitude: 5, yAmplitude: 7, opacity: 0.10),
    _BubbleDef(size: 40, dx: 0.60, dy: 0.75, phaseOffset: 0.33, xAmplitude: 4, yAmplitude: 5, opacity: 0.07),
    _BubbleDef(size: 22, dx: 0.20, dy: 0.20, phaseOffset: 0.66, xAmplitude: 3, yAmplitude: 4, opacity: 0.08),
  ],
  // Card 1 – Attendance
  <_BubbleDef>[
    _BubbleDef(size: 60, dx: 0.80, dy: 0.80, phaseOffset: 0.20, xAmplitude: 6, yAmplitude: 5, opacity: 0.10),
    _BubbleDef(size: 35, dx: 0.15, dy: 0.55, phaseOffset: 0.55, xAmplitude: 4, yAmplitude: 6, opacity: 0.07),
    _BubbleDef(size: 20, dx: 0.70, dy: 0.20, phaseOffset: 0.80, xAmplitude: 3, yAmplitude: 3, opacity: 0.08),
  ],
  // Card 2 – Complain
  <_BubbleDef>[
    _BubbleDef(size: 65, dx: 0.10, dy: 0.80, phaseOffset: 0.10, xAmplitude: 5, yAmplitude: 6, opacity: 0.10),
    _BubbleDef(size: 38, dx: 0.80, dy: 0.30, phaseOffset: 0.45, xAmplitude: 4, yAmplitude: 5, opacity: 0.07),
    _BubbleDef(size: 18, dx: 0.45, dy: 0.55, phaseOffset: 0.72, xAmplitude: 3, yAmplitude: 4, opacity: 0.09),
  ],
  // Card 3 – Contact Teacher
  <_BubbleDef>[
    _BubbleDef(size: 55, dx: 0.90, dy: 0.55, phaseOffset: 0.30, xAmplitude: 6, yAmplitude: 4, opacity: 0.10),
    _BubbleDef(size: 32, dx: 0.25, dy: 0.80, phaseOffset: 0.60, xAmplitude: 4, yAmplitude: 6, opacity: 0.07),
    _BubbleDef(size: 20, dx: 0.55, dy: 0.15, phaseOffset: 0.15, xAmplitude: 3, yAmplitude: 3, opacity: 0.08),
  ],
  // Card 4 – Lost & Found
  <_BubbleDef>[
    _BubbleDef(size: 68, dx: 0.75, dy: 0.15, phaseOffset: 0.50, xAmplitude: 5, yAmplitude: 7, opacity: 0.10),
    _BubbleDef(size: 36, dx: 0.10, dy: 0.60, phaseOffset: 0.25, xAmplitude: 4, yAmplitude: 5, opacity: 0.07),
    _BubbleDef(size: 22, dx: 0.55, dy: 0.80, phaseOffset: 0.75, xAmplitude: 3, yAmplitude: 4, opacity: 0.09),
  ],
  // Card 5 – More
  <_BubbleDef>[
    _BubbleDef(size: 58, dx: 0.20, dy: 0.20, phaseOffset: 0.40, xAmplitude: 6, yAmplitude: 5, opacity: 0.10),
    _BubbleDef(size: 34, dx: 0.80, dy: 0.70, phaseOffset: 0.65, xAmplitude: 4, yAmplitude: 6, opacity: 0.07),
    _BubbleDef(size: 19, dx: 0.50, dy: 0.45, phaseOffset: 0.10, xAmplitude: 3, yAmplitude: 3, opacity: 0.08),
  ],
];

// ─── Animated bubble layer ────────────────────────────────────────────────────

class _BubbleLayer extends StatefulWidget {
  const _BubbleLayer({required this.bubbles, required this.color});
  final List<_BubbleDef> bubbles;
  final Color color;

  @override
  State<_BubbleLayer> createState() => _BubbleLayerState();
}

class _BubbleLayerState extends State<_BubbleLayer>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (BuildContext ctx, Widget? child) {
        return LayoutBuilder(
          builder: (BuildContext ctx2, BoxConstraints constraints) {
            final double w = constraints.maxWidth;
            final double h = constraints.maxHeight;
            return Stack(
              clipBehavior: Clip.hardEdge,
              children: widget.bubbles.map((_BubbleDef b) {
                final double t = (_ctrl.value + b.phaseOffset) % 1.0;
                final double angle = t * 2 * math.pi;
                final double cx = w * b.dx + math.sin(angle) * b.xAmplitude;
                final double cy = h * b.dy + math.cos(angle) * b.yAmplitude;
                return Positioned(
                  left: cx - b.size / 2,
                  top: cy - b.size / 2,
                  child: Container(
                    width: b.size,
                    height: b.size,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: widget.color.withValues(alpha: b.opacity),
                    ),
                  ),
                );
              }).toList(),
            );
          },
        );
      },
    );
  }
}

// ─── Public ActionCard component ──────────────────────────────────────────────

class ActionCard extends StatelessWidget {
  const ActionCard({
    super.key,
    required this.label,
    required this.icon,
    required this.gradient,
    required this.accentColor,
    required this.cardIndex,
    this.badge,
    this.onTap,
    this.child,
  });

  final String label;
  final IconData icon;
  final List<Color> gradient;
  final Color accentColor;
  final int cardIndex;
  final Widget? badge;
  final VoidCallback? onTap;
  // Optional fully custom content (e.g. More tile)
  final Widget? child;

  List<_BubbleDef> get _bubbles =>
      _kCardBubbles[cardIndex % _kCardBubbles.length];

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradient,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(22),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: gradient.last.withValues(alpha: 0.35),
              blurRadius: 12,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(22),
          child: Stack(
            children: <Widget>[
              // Animated bubbles
              Positioned.fill(
                child: _BubbleLayer(
                  bubbles: _bubbles,
                  color: Colors.white,
                ),
              ),
              // Content
              Padding(
                padding: const EdgeInsets.all(16),
                child: child ??
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Row(
                          children: <Widget>[
                            Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                color: accentColor.withValues(alpha: 0.18),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(icon, size: 22, color: accentColor),
                            ),
                            if (badge != null) ...<Widget>[
                              const Spacer(),
                              badge!,
                            ],
                          ],
                        ),
                        const Spacer(),
                        Text(
                          label,
                          maxLines: 2,
                          style: const TextStyle(
                            fontFamily: 'Plus Jakarta Sans',
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            height: 1.25,
                          ),
                        ),
                      ],
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
