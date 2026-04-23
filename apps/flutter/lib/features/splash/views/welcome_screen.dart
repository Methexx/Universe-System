import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:universe_app/core/constants/app_routes.dart';

class OnboardingData {
  final String imagePath;
  final String title;
  final String subtitle;

  OnboardingData({
    required this.imagePath,
    required this.title,
    required this.subtitle,
  });
}

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    OnboardingData(
      imagePath: 'Assets/welcome1.png',
      title: 'Find various courses on\nOur platform',
      subtitle:
          'Courses that are different from the others that you will find only with us',
    ),
    OnboardingData(
      imagePath: 'Assets/welcome2.png',
      title: 'Learn from industry\nExperts',
      subtitle: 'Select from hundreds of expert tutors\nto learn effectively',
    ),
    OnboardingData(
      imagePath: 'Assets/welcome3.png',
      title: 'Get certified and\nAchieve goals',
      subtitle: 'Earn certificates to boost your career\nand stay ahead',
    ),
  ];

  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startAutoPlay();
  }

  void _stopAutoPlay() {
    if (_timer != null && _timer!.isActive) {
      _timer!.cancel();
    }
  }

  void _startAutoPlay() {
    _timer = Timer.periodic(const Duration(seconds: 3), (Timer timer) {
      if (_currentPage < _pages.length - 1) {
        _currentPage++;
      } else {
        _currentPage = 0; // Loop back to the first page
      }

      if (_pageController.hasClients) {
        _pageController.animateToPage(
          _currentPage,
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeIn,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final TextTheme textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: const Color(0xFFF0FBFF),
      body: SafeArea(
        bottom: false,
        child: Stack(
          alignment: Alignment.bottomCenter,
          children: <Widget>[
            Column(
              children: <Widget>[
                const Expanded(child: SizedBox()),
                Container(
                  width: 350,
                  height: 320,
                  decoration: ShapeDecoration(
                    color: const Color(0xFFFFFFFF),
                    shape: ContinuousRectangleBorder(
                      borderRadius: BorderRadius.circular(42),
                    ),
                  ),
                ),
                const SizedBox(height: 50),
              ],
            ),
            Listener(
              onPointerDown: (_) => _stopAutoPlay(),
              child: PageView.builder(
                controller: _pageController,
                itemCount: _pages.length,
                onPageChanged: (int index) {
                  setState(() {
                    _currentPage = index;
                  });
                },
                itemBuilder: (context, index) {
                  return Column(
                    children: <Widget>[
                      Expanded(
                        child: Stack(
                          clipBehavior: Clip.none,
                          alignment: Alignment.bottomCenter,
                          children: [
                            SizedBox(
                              width: double.infinity,
                              child: Padding(
                                padding: EdgeInsets.only(
                                  bottom: _pages[index].imagePath == 'Assets/welcome2.png' ? 84.0 : 0.0,
                                ),
                                child: Image.asset(
                                  _pages[index].imagePath,
                                  fit: BoxFit.cover,
                                  alignment: Alignment.topCenter,
                                ),
                              ),
                            ),
                            if (_pages[index].imagePath ==
                                'Assets/welcome2.png')
                              Positioned(
                                bottom: 42,
                                child: Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(
                                          alpha: 0.15,
                                        ),
                                        blurRadius: 15,
                                        offset: const Offset(0, 8),
                                      ),
                                    ],
                                  ),
                                  child: Image.asset(
                                    'Assets/logo.png',
                                    height: 84,
                                    fit: BoxFit.contain,
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                      Container(
                        width: 350,
                        height: 320,
                        padding: const EdgeInsets.fromLTRB(24, 60, 24, 40),
                        child: Column(
                          children: <Widget>[
                            Text(
                              _pages[index].title,
                              textAlign: TextAlign.center,
                              style: textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.w800,
                                color: const Color(0xFF101820),
                                height: 1.2,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _pages[index].subtitle,
                              textAlign: TextAlign.center,
                              style: textTheme.bodyMedium?.copyWith(
                                color: const Color(0xFFA7BFC6),
                                height: 1.5,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 50),
                    ],
                  );
                },
              ),
            ),
            Positioned(
              bottom: 334,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _pages.length,
                  (index) => Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 500),
                      width: 80, // Increased indicator width
                      height: 4,
                      decoration: BoxDecoration(
                        color: _currentPage == index
                            ? const Color(0xFF6ACFEF)
                            : const Color(0xFFE3F7FD),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 110,
              child: Container(
                width: 302,
                height: 56,
                decoration: ShapeDecoration(
                  shape: ContinuousRectangleBorder(
                    borderRadius: BorderRadius.circular(28),
                  ),
                  shadows: <BoxShadow>[
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.11),
                      blurRadius: 4,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: () => context.go(AppRoutes.login),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6ACFEF),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: ContinuousRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                  child: const Text(
                    'Login',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 65,
              child: MouseRegion(
                cursor: SystemMouseCursors.click,
                child: GestureDetector(
                  onTap: () => context.go(AppRoutes.register),
                  child: RichText(
                    text: TextSpan(
                      text: 'Dont have an account ? ',
                      style: const TextStyle(
                        fontFamily: 'Plus Jakarta Sans',
                        color: Colors.black,
                        fontSize: 14,
                        fontWeight: FontWeight.w400,
                      ),
                      children: const <TextSpan>[
                        TextSpan(
                          text: 'Create one',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: Colors.black,
                          ),
                        ),
                      ],
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
