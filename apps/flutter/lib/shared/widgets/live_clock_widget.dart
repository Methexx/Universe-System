import 'dart:async';
import 'package:flutter/material.dart';

class LiveClockWidget extends StatefulWidget {
  const LiveClockWidget({
    super.key,
    this.backgroundColor = Colors.white,
    this.textColor = const Color(0xFF111827),
    this.dateColor = const Color(0xFF1F2937),
    this.amPmColor = const Color(0xFF6B7280),
    this.dotColor = const Color(0xFFDF5B6D),
    this.compact = false,
  });

  final Color backgroundColor;
  final Color textColor;
  final Color dateColor;
  final Color amPmColor;
  final Color dotColor;
  final bool compact;

  @override
  State<LiveClockWidget> createState() => _LiveClockWidgetState();
}

class _LiveClockWidgetState extends State<LiveClockWidget>
    with SingleTickerProviderStateMixin {
  late Timer _clockTimer;
  late AnimationController _blinkController;
  late Animation<double> _blinkAnim;
  late DateTime _now;

  @override
  void initState() {
    super.initState();
    _now = DateTime.now();

    // Tick every second
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });

    // Blinking colon animation
    _blinkController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);

    _blinkAnim = Tween<double>(begin: 0.15, end: 1.0).animate(
      CurvedAnimation(parent: _blinkController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _clockTimer.cancel();
    _blinkController.dispose();
    super.dispose();
  }

  String get _dateLabel {
    const List<String> months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[_now.month - 1]} ${_now.day}';
  }

  String get _hours => (_now.hour % 12 == 0 ? 12 : _now.hour % 12).toString();
  String get _minutes => _now.minute.toString().padLeft(2, '0');
  String get _amPm => _now.hour < 12 ? 'AM' : 'PM';

  @override
  Widget build(BuildContext context) {
    if (widget.compact) {
      return _buildCompact();
    }
    return _buildFull();
  }

  Widget _buildFull() {
    return Container(
      width: 88,
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: ShapeDecoration(
        color: widget.backgroundColor,
        shape: ContinuousRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(
            _dateLabel,
            style: TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: widget.dateColor,
            ),
          ),
          const SizedBox(height: 1),
          AnimatedBuilder(
            animation: _blinkAnim,
            builder: (BuildContext context, Widget? child) {
              return Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: <Widget>[
                  Text(
                    _hours,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: widget.textColor,
                      height: 1,
                    ),
                  ),
                  Opacity(
                    opacity: _blinkAnim.value,
                    child: Text(
                      ':',
                      style: TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: widget.dotColor,
                        height: 1,
                      ),
                    ),
                  ),
                  Text(
                    _minutes,
                    style: TextStyle(
                      fontFamily: 'Plus Jakarta Sans',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: widget.textColor,
                      height: 1,
                    ),
                  ),
                ],
              );
            },
          ),
          Text(
            _amPm,
            style: TextStyle(
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: widget.amPmColor,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompact() {
    return AnimatedBuilder(
      animation: _blinkAnim,
      builder: (BuildContext context, Widget? child) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: <Widget>[
            Text(
              _hours,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: widget.textColor,
                height: 1,
              ),
            ),
            Opacity(
              opacity: _blinkAnim.value,
              child: Text(
                ':',
                style: TextStyle(
                  fontFamily: 'Plus Jakarta Sans',
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: widget.dotColor,
                  height: 1,
                ),
              ),
            ),
            Text(
              _minutes,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: widget.textColor,
                height: 1,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              _amPm,
              style: TextStyle(
                fontFamily: 'Plus Jakarta Sans',
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: widget.amPmColor,
              ),
            ),
          ],
        );
      },
    );
  }
}
