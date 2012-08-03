/**
 * August 3, 2012 Modifications:
 * 
 *    * Applied solution for possible variable scoping issues. 
 *    * Namespaces the Recognizer and Point classes.
 *    
 *    Jonathan Cipriano
 *    AKQA, Creative Research & Development
 *    118 King Street, 6th Floor
 *    San Francisco, CA 94108
 *
 * The $1 Unistroke Recognizer (C# version)
 *
 *		Jacob O. Wobbrock, Ph.D.
 * 		The Information School
 *		University of Washington
 *		Mary Gates Hall, Box 352840
 *		Seattle, WA 98195-2840
 *		wobbrock@uw.edu
 *
 *		Andrew D. Wilson, Ph.D.
 *		Microsoft Research
 *		One Microsoft Way
 *		Redmond, WA 98052
 *		awilson@microsoft.com
 *
 *		Yang Li, Ph.D.
 *		Department of Computer Science and Engineering
 * 		University of Washington
 *		The Allen Center, Box 352350
 *		Seattle, WA 98195-2840
 * 		yangli@cs.washington.edu
 *
 * The Protractor enhancement was published by Yang Li and programmed here by 
 * Jacob O. Wobbrock.
 *
 *	Li, Y. (2010). Protractor: A fast and accurate gesture 
 *	  recognizer. Proceedings of the ACM Conference on Human 
 *	  Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *	  (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 * 
 * This software is distributed under the "New BSD License" agreement:
 * 
 * Copyright (c) 2007-2011, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote 
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, 
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, 
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/


(function(){
  
  var Dollar = this.Dollar = { };

  //
  // Point class
  //
  Dollar.Point = function(x, y) // constructor
  {
  	this.X = x;
  	this.Y = y;
  }
  //
  // Rectangle class
  //
  function Rectangle(x, y, width, height) // constructor
  {
  	this.X = x;
  	this.Y = y;
  	this.Width = width;
  	this.Height = height;
  }
  //
  // Template class: a unistroke template
  //
  function Template(name, points) // constructor
  {
  	this.Name = name;
  	this.Points = Resample(points, NumPoints);
  	var radians = IndicativeAngle(this.Points);
  	this.Points = RotateBy(this.Points, -radians);
  	this.Points = ScaleTo(this.Points, SquareSize);
  	this.Points = TranslateTo(this.Points, Origin);
  	this.Vector = Vectorize(this.Points); // for Protractor
  }
  //
  // Result class
  //
  function Result(name, score) // constructor
  {
  	this.Name = name;
  	this.Score = score;
  }
  //
  // DollarRecognizer class constants
  //
  var NumTemplates = 16;
  var NumPoints = 64;
  var SquareSize = 250.0;
  var Origin = new Dollar.Point(0,0);
  var Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
  var HalfDiagonal = 0.5 * Diagonal;
  var AngleRange = Deg2Rad(45.0);
  var AnglePrecision = Deg2Rad(2.0);
  var Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
  //
  // DollarRecognizer class
  //
  Dollar.Recognizer = function() // constructor
  {
  	//
  	// one predefined template for each unistroke type
  	//
  	this.Templates = new Array();
  	this.Templates[0] = new Template("triangle", new Array(new Dollar.Point(137,139),new Dollar.Point(135,141),new Dollar.Point(133,144),new Dollar.Point(132,146),new Dollar.Point(130,149),new Dollar.Point(128,151),new Dollar.Point(126,155),new Dollar.Point(123,160),new Dollar.Point(120,166),new Dollar.Point(116,171),new Dollar.Point(112,177),new Dollar.Point(107,183),new Dollar.Point(102,188),new Dollar.Point(100,191),new Dollar.Point(95,195),new Dollar.Point(90,199),new Dollar.Point(86,203),new Dollar.Point(82,206),new Dollar.Point(80,209),new Dollar.Point(75,213),new Dollar.Point(73,213),new Dollar.Point(70,216),new Dollar.Point(67,219),new Dollar.Point(64,221),new Dollar.Point(61,223),new Dollar.Point(60,225),new Dollar.Point(62,226),new Dollar.Point(65,225),new Dollar.Point(67,226),new Dollar.Point(74,226),new Dollar.Point(77,227),new Dollar.Point(85,229),new Dollar.Point(91,230),new Dollar.Point(99,231),new Dollar.Point(108,232),new Dollar.Point(116,233),new Dollar.Point(125,233),new Dollar.Point(134,234),new Dollar.Point(145,233),new Dollar.Point(153,232),new Dollar.Point(160,233),new Dollar.Point(170,234),new Dollar.Point(177,235),new Dollar.Point(179,236),new Dollar.Point(186,237),new Dollar.Point(193,238),new Dollar.Point(198,239),new Dollar.Point(200,237),new Dollar.Point(202,239),new Dollar.Point(204,238),new Dollar.Point(206,234),new Dollar.Point(205,230),new Dollar.Point(202,222),new Dollar.Point(197,216),new Dollar.Point(192,207),new Dollar.Point(186,198),new Dollar.Point(179,189),new Dollar.Point(174,183),new Dollar.Point(170,178),new Dollar.Point(164,171),new Dollar.Point(161,168),new Dollar.Point(154,160),new Dollar.Point(148,155),new Dollar.Point(143,150),new Dollar.Point(138,148),new Dollar.Point(136,148)));
  	this.Templates[1] = new Template("x", new Array(new Dollar.Point(87,142),new Dollar.Point(89,145),new Dollar.Point(91,148),new Dollar.Point(93,151),new Dollar.Point(96,155),new Dollar.Point(98,157),new Dollar.Point(100,160),new Dollar.Point(102,162),new Dollar.Point(106,167),new Dollar.Point(108,169),new Dollar.Point(110,171),new Dollar.Point(115,177),new Dollar.Point(119,183),new Dollar.Point(123,189),new Dollar.Point(127,193),new Dollar.Point(129,196),new Dollar.Point(133,200),new Dollar.Point(137,206),new Dollar.Point(140,209),new Dollar.Point(143,212),new Dollar.Point(146,215),new Dollar.Point(151,220),new Dollar.Point(153,222),new Dollar.Point(155,223),new Dollar.Point(157,225),new Dollar.Point(158,223),new Dollar.Point(157,218),new Dollar.Point(155,211),new Dollar.Point(154,208),new Dollar.Point(152,200),new Dollar.Point(150,189),new Dollar.Point(148,179),new Dollar.Point(147,170),new Dollar.Point(147,158),new Dollar.Point(147,148),new Dollar.Point(147,141),new Dollar.Point(147,136),new Dollar.Point(144,135),new Dollar.Point(142,137),new Dollar.Point(140,139),new Dollar.Point(135,145),new Dollar.Point(131,152),new Dollar.Point(124,163),new Dollar.Point(116,177),new Dollar.Point(108,191),new Dollar.Point(100,206),new Dollar.Point(94,217),new Dollar.Point(91,222),new Dollar.Point(89,225),new Dollar.Point(87,226),new Dollar.Point(87,224)));
  	this.Templates[2] = new Template("rectangle", new Array(new Dollar.Point(78,149),new Dollar.Point(78,153),new Dollar.Point(78,157),new Dollar.Point(78,160),new Dollar.Point(79,162),new Dollar.Point(79,164),new Dollar.Point(79,167),new Dollar.Point(79,169),new Dollar.Point(79,173),new Dollar.Point(79,178),new Dollar.Point(79,183),new Dollar.Point(80,189),new Dollar.Point(80,193),new Dollar.Point(80,198),new Dollar.Point(80,202),new Dollar.Point(81,208),new Dollar.Point(81,210),new Dollar.Point(81,216),new Dollar.Point(82,222),new Dollar.Point(82,224),new Dollar.Point(82,227),new Dollar.Point(83,229),new Dollar.Point(83,231),new Dollar.Point(85,230),new Dollar.Point(88,232),new Dollar.Point(90,233),new Dollar.Point(92,232),new Dollar.Point(94,233),new Dollar.Point(99,232),new Dollar.Point(102,233),new Dollar.Point(106,233),new Dollar.Point(109,234),new Dollar.Point(117,235),new Dollar.Point(123,236),new Dollar.Point(126,236),new Dollar.Point(135,237),new Dollar.Point(142,238),new Dollar.Point(145,238),new Dollar.Point(152,238),new Dollar.Point(154,239),new Dollar.Point(165,238),new Dollar.Point(174,237),new Dollar.Point(179,236),new Dollar.Point(186,235),new Dollar.Point(191,235),new Dollar.Point(195,233),new Dollar.Point(197,233),new Dollar.Point(200,233),new Dollar.Point(201,235),new Dollar.Point(201,233),new Dollar.Point(199,231),new Dollar.Point(198,226),new Dollar.Point(198,220),new Dollar.Point(196,207),new Dollar.Point(195,195),new Dollar.Point(195,181),new Dollar.Point(195,173),new Dollar.Point(195,163),new Dollar.Point(194,155),new Dollar.Point(192,145),new Dollar.Point(192,143),new Dollar.Point(192,138),new Dollar.Point(191,135),new Dollar.Point(191,133),new Dollar.Point(191,130),new Dollar.Point(190,128),new Dollar.Point(188,129),new Dollar.Point(186,129),new Dollar.Point(181,132),new Dollar.Point(173,131),new Dollar.Point(162,131),new Dollar.Point(151,132),new Dollar.Point(149,132),new Dollar.Point(138,132),new Dollar.Point(136,132),new Dollar.Point(122,131),new Dollar.Point(120,131),new Dollar.Point(109,130),new Dollar.Point(107,130),new Dollar.Point(90,132),new Dollar.Point(81,133),new Dollar.Point(76,133)));
  	this.Templates[3] = new Template("circle", new Array(new Dollar.Point(127,141),new Dollar.Point(124,140),new Dollar.Point(120,139),new Dollar.Point(118,139),new Dollar.Point(116,139),new Dollar.Point(111,140),new Dollar.Point(109,141),new Dollar.Point(104,144),new Dollar.Point(100,147),new Dollar.Point(96,152),new Dollar.Point(93,157),new Dollar.Point(90,163),new Dollar.Point(87,169),new Dollar.Point(85,175),new Dollar.Point(83,181),new Dollar.Point(82,190),new Dollar.Point(82,195),new Dollar.Point(83,200),new Dollar.Point(84,205),new Dollar.Point(88,213),new Dollar.Point(91,216),new Dollar.Point(96,219),new Dollar.Point(103,222),new Dollar.Point(108,224),new Dollar.Point(111,224),new Dollar.Point(120,224),new Dollar.Point(133,223),new Dollar.Point(142,222),new Dollar.Point(152,218),new Dollar.Point(160,214),new Dollar.Point(167,210),new Dollar.Point(173,204),new Dollar.Point(178,198),new Dollar.Point(179,196),new Dollar.Point(182,188),new Dollar.Point(182,177),new Dollar.Point(178,167),new Dollar.Point(170,150),new Dollar.Point(163,138),new Dollar.Point(152,130),new Dollar.Point(143,129),new Dollar.Point(140,131),new Dollar.Point(129,136),new Dollar.Point(126,139)));
  	this.Templates[4] = new Template("check", new Array(new Dollar.Point(91,185),new Dollar.Point(93,185),new Dollar.Point(95,185),new Dollar.Point(97,185),new Dollar.Point(100,188),new Dollar.Point(102,189),new Dollar.Point(104,190),new Dollar.Point(106,193),new Dollar.Point(108,195),new Dollar.Point(110,198),new Dollar.Point(112,201),new Dollar.Point(114,204),new Dollar.Point(115,207),new Dollar.Point(117,210),new Dollar.Point(118,212),new Dollar.Point(120,214),new Dollar.Point(121,217),new Dollar.Point(122,219),new Dollar.Point(123,222),new Dollar.Point(124,224),new Dollar.Point(126,226),new Dollar.Point(127,229),new Dollar.Point(129,231),new Dollar.Point(130,233),new Dollar.Point(129,231),new Dollar.Point(129,228),new Dollar.Point(129,226),new Dollar.Point(129,224),new Dollar.Point(129,221),new Dollar.Point(129,218),new Dollar.Point(129,212),new Dollar.Point(129,208),new Dollar.Point(130,198),new Dollar.Point(132,189),new Dollar.Point(134,182),new Dollar.Point(137,173),new Dollar.Point(143,164),new Dollar.Point(147,157),new Dollar.Point(151,151),new Dollar.Point(155,144),new Dollar.Point(161,137),new Dollar.Point(165,131),new Dollar.Point(171,122),new Dollar.Point(174,118),new Dollar.Point(176,114),new Dollar.Point(177,112),new Dollar.Point(177,114),new Dollar.Point(175,116),new Dollar.Point(173,118)));
  	this.Templates[5] = new Template("caret", new Array(new Dollar.Point(79,245),new Dollar.Point(79,242),new Dollar.Point(79,239),new Dollar.Point(80,237),new Dollar.Point(80,234),new Dollar.Point(81,232),new Dollar.Point(82,230),new Dollar.Point(84,224),new Dollar.Point(86,220),new Dollar.Point(86,218),new Dollar.Point(87,216),new Dollar.Point(88,213),new Dollar.Point(90,207),new Dollar.Point(91,202),new Dollar.Point(92,200),new Dollar.Point(93,194),new Dollar.Point(94,192),new Dollar.Point(96,189),new Dollar.Point(97,186),new Dollar.Point(100,179),new Dollar.Point(102,173),new Dollar.Point(105,165),new Dollar.Point(107,160),new Dollar.Point(109,158),new Dollar.Point(112,151),new Dollar.Point(115,144),new Dollar.Point(117,139),new Dollar.Point(119,136),new Dollar.Point(119,134),new Dollar.Point(120,132),new Dollar.Point(121,129),new Dollar.Point(122,127),new Dollar.Point(124,125),new Dollar.Point(126,124),new Dollar.Point(129,125),new Dollar.Point(131,127),new Dollar.Point(132,130),new Dollar.Point(136,139),new Dollar.Point(141,154),new Dollar.Point(145,166),new Dollar.Point(151,182),new Dollar.Point(156,193),new Dollar.Point(157,196),new Dollar.Point(161,209),new Dollar.Point(162,211),new Dollar.Point(167,223),new Dollar.Point(169,229),new Dollar.Point(170,231),new Dollar.Point(173,237),new Dollar.Point(176,242),new Dollar.Point(177,244),new Dollar.Point(179,250),new Dollar.Point(181,255),new Dollar.Point(182,257)));
  	this.Templates[6] = new Template("zig-zag", new Array(new Dollar.Point(307,216),new Dollar.Point(333,186),new Dollar.Point(356,215),new Dollar.Point(375,186),new Dollar.Point(399,216),new Dollar.Point(418,186)));
  	this.Templates[7] = new Template("arrow", new Array(new Dollar.Point(68,222),new Dollar.Point(70,220),new Dollar.Point(73,218),new Dollar.Point(75,217),new Dollar.Point(77,215),new Dollar.Point(80,213),new Dollar.Point(82,212),new Dollar.Point(84,210),new Dollar.Point(87,209),new Dollar.Point(89,208),new Dollar.Point(92,206),new Dollar.Point(95,204),new Dollar.Point(101,201),new Dollar.Point(106,198),new Dollar.Point(112,194),new Dollar.Point(118,191),new Dollar.Point(124,187),new Dollar.Point(127,186),new Dollar.Point(132,183),new Dollar.Point(138,181),new Dollar.Point(141,180),new Dollar.Point(146,178),new Dollar.Point(154,173),new Dollar.Point(159,171),new Dollar.Point(161,170),new Dollar.Point(166,167),new Dollar.Point(168,167),new Dollar.Point(171,166),new Dollar.Point(174,164),new Dollar.Point(177,162),new Dollar.Point(180,160),new Dollar.Point(182,158),new Dollar.Point(183,156),new Dollar.Point(181,154),new Dollar.Point(178,153),new Dollar.Point(171,153),new Dollar.Point(164,153),new Dollar.Point(160,153),new Dollar.Point(150,154),new Dollar.Point(147,155),new Dollar.Point(141,157),new Dollar.Point(137,158),new Dollar.Point(135,158),new Dollar.Point(137,158),new Dollar.Point(140,157),new Dollar.Point(143,156),new Dollar.Point(151,154),new Dollar.Point(160,152),new Dollar.Point(170,149),new Dollar.Point(179,147),new Dollar.Point(185,145),new Dollar.Point(192,144),new Dollar.Point(196,144),new Dollar.Point(198,144),new Dollar.Point(200,144),new Dollar.Point(201,147),new Dollar.Point(199,149),new Dollar.Point(194,157),new Dollar.Point(191,160),new Dollar.Point(186,167),new Dollar.Point(180,176),new Dollar.Point(177,179),new Dollar.Point(171,187),new Dollar.Point(169,189),new Dollar.Point(165,194),new Dollar.Point(164,196)));
  	this.Templates[8] = new Template("left square bracket", new Array(new Dollar.Point(140,124),new Dollar.Point(138,123),new Dollar.Point(135,122),new Dollar.Point(133,123),new Dollar.Point(130,123),new Dollar.Point(128,124),new Dollar.Point(125,125),new Dollar.Point(122,124),new Dollar.Point(120,124),new Dollar.Point(118,124),new Dollar.Point(116,125),new Dollar.Point(113,125),new Dollar.Point(111,125),new Dollar.Point(108,124),new Dollar.Point(106,125),new Dollar.Point(104,125),new Dollar.Point(102,124),new Dollar.Point(100,123),new Dollar.Point(98,123),new Dollar.Point(95,124),new Dollar.Point(93,123),new Dollar.Point(90,124),new Dollar.Point(88,124),new Dollar.Point(85,125),new Dollar.Point(83,126),new Dollar.Point(81,127),new Dollar.Point(81,129),new Dollar.Point(82,131),new Dollar.Point(82,134),new Dollar.Point(83,138),new Dollar.Point(84,141),new Dollar.Point(84,144),new Dollar.Point(85,148),new Dollar.Point(85,151),new Dollar.Point(86,156),new Dollar.Point(86,160),new Dollar.Point(86,164),new Dollar.Point(86,168),new Dollar.Point(87,171),new Dollar.Point(87,175),new Dollar.Point(87,179),new Dollar.Point(87,182),new Dollar.Point(87,186),new Dollar.Point(88,188),new Dollar.Point(88,195),new Dollar.Point(88,198),new Dollar.Point(88,201),new Dollar.Point(88,207),new Dollar.Point(89,211),new Dollar.Point(89,213),new Dollar.Point(89,217),new Dollar.Point(89,222),new Dollar.Point(88,225),new Dollar.Point(88,229),new Dollar.Point(88,231),new Dollar.Point(88,233),new Dollar.Point(88,235),new Dollar.Point(89,237),new Dollar.Point(89,240),new Dollar.Point(89,242),new Dollar.Point(91,241),new Dollar.Point(94,241),new Dollar.Point(96,240),new Dollar.Point(98,239),new Dollar.Point(105,240),new Dollar.Point(109,240),new Dollar.Point(113,239),new Dollar.Point(116,240),new Dollar.Point(121,239),new Dollar.Point(130,240),new Dollar.Point(136,237),new Dollar.Point(139,237),new Dollar.Point(144,238),new Dollar.Point(151,237),new Dollar.Point(157,236),new Dollar.Point(159,237)));
  	this.Templates[9] = new Template("right square bracket", new Array(new Dollar.Point(112,138),new Dollar.Point(112,136),new Dollar.Point(115,136),new Dollar.Point(118,137),new Dollar.Point(120,136),new Dollar.Point(123,136),new Dollar.Point(125,136),new Dollar.Point(128,136),new Dollar.Point(131,136),new Dollar.Point(134,135),new Dollar.Point(137,135),new Dollar.Point(140,134),new Dollar.Point(143,133),new Dollar.Point(145,132),new Dollar.Point(147,132),new Dollar.Point(149,132),new Dollar.Point(152,132),new Dollar.Point(153,134),new Dollar.Point(154,137),new Dollar.Point(155,141),new Dollar.Point(156,144),new Dollar.Point(157,152),new Dollar.Point(158,161),new Dollar.Point(160,170),new Dollar.Point(162,182),new Dollar.Point(164,192),new Dollar.Point(166,200),new Dollar.Point(167,209),new Dollar.Point(168,214),new Dollar.Point(168,216),new Dollar.Point(169,221),new Dollar.Point(169,223),new Dollar.Point(169,228),new Dollar.Point(169,231),new Dollar.Point(166,233),new Dollar.Point(164,234),new Dollar.Point(161,235),new Dollar.Point(155,236),new Dollar.Point(147,235),new Dollar.Point(140,233),new Dollar.Point(131,233),new Dollar.Point(124,233),new Dollar.Point(117,235),new Dollar.Point(114,238),new Dollar.Point(112,238)));
  	this.Templates[10] = new Template("v", new Array(new Dollar.Point(89,164),new Dollar.Point(90,162),new Dollar.Point(92,162),new Dollar.Point(94,164),new Dollar.Point(95,166),new Dollar.Point(96,169),new Dollar.Point(97,171),new Dollar.Point(99,175),new Dollar.Point(101,178),new Dollar.Point(103,182),new Dollar.Point(106,189),new Dollar.Point(108,194),new Dollar.Point(111,199),new Dollar.Point(114,204),new Dollar.Point(117,209),new Dollar.Point(119,214),new Dollar.Point(122,218),new Dollar.Point(124,222),new Dollar.Point(126,225),new Dollar.Point(128,228),new Dollar.Point(130,229),new Dollar.Point(133,233),new Dollar.Point(134,236),new Dollar.Point(136,239),new Dollar.Point(138,240),new Dollar.Point(139,242),new Dollar.Point(140,244),new Dollar.Point(142,242),new Dollar.Point(142,240),new Dollar.Point(142,237),new Dollar.Point(143,235),new Dollar.Point(143,233),new Dollar.Point(145,229),new Dollar.Point(146,226),new Dollar.Point(148,217),new Dollar.Point(149,208),new Dollar.Point(149,205),new Dollar.Point(151,196),new Dollar.Point(151,193),new Dollar.Point(153,182),new Dollar.Point(155,172),new Dollar.Point(157,165),new Dollar.Point(159,160),new Dollar.Point(162,155),new Dollar.Point(164,150),new Dollar.Point(165,148),new Dollar.Point(166,146)));
  	this.Templates[11] = new Template("delete", new Array(new Dollar.Point(123,129),new Dollar.Point(123,131),new Dollar.Point(124,133),new Dollar.Point(125,136),new Dollar.Point(127,140),new Dollar.Point(129,142),new Dollar.Point(133,148),new Dollar.Point(137,154),new Dollar.Point(143,158),new Dollar.Point(145,161),new Dollar.Point(148,164),new Dollar.Point(153,170),new Dollar.Point(158,176),new Dollar.Point(160,178),new Dollar.Point(164,183),new Dollar.Point(168,188),new Dollar.Point(171,191),new Dollar.Point(175,196),new Dollar.Point(178,200),new Dollar.Point(180,202),new Dollar.Point(181,205),new Dollar.Point(184,208),new Dollar.Point(186,210),new Dollar.Point(187,213),new Dollar.Point(188,215),new Dollar.Point(186,212),new Dollar.Point(183,211),new Dollar.Point(177,208),new Dollar.Point(169,206),new Dollar.Point(162,205),new Dollar.Point(154,207),new Dollar.Point(145,209),new Dollar.Point(137,210),new Dollar.Point(129,214),new Dollar.Point(122,217),new Dollar.Point(118,218),new Dollar.Point(111,221),new Dollar.Point(109,222),new Dollar.Point(110,219),new Dollar.Point(112,217),new Dollar.Point(118,209),new Dollar.Point(120,207),new Dollar.Point(128,196),new Dollar.Point(135,187),new Dollar.Point(138,183),new Dollar.Point(148,167),new Dollar.Point(157,153),new Dollar.Point(163,145),new Dollar.Point(165,142),new Dollar.Point(172,133),new Dollar.Point(177,127),new Dollar.Point(179,127),new Dollar.Point(180,125)));
  	this.Templates[12] = new Template("left curly brace", new Array(new Dollar.Point(150,116),new Dollar.Point(147,117),new Dollar.Point(145,116),new Dollar.Point(142,116),new Dollar.Point(139,117),new Dollar.Point(136,117),new Dollar.Point(133,118),new Dollar.Point(129,121),new Dollar.Point(126,122),new Dollar.Point(123,123),new Dollar.Point(120,125),new Dollar.Point(118,127),new Dollar.Point(115,128),new Dollar.Point(113,129),new Dollar.Point(112,131),new Dollar.Point(113,134),new Dollar.Point(115,134),new Dollar.Point(117,135),new Dollar.Point(120,135),new Dollar.Point(123,137),new Dollar.Point(126,138),new Dollar.Point(129,140),new Dollar.Point(135,143),new Dollar.Point(137,144),new Dollar.Point(139,147),new Dollar.Point(141,149),new Dollar.Point(140,152),new Dollar.Point(139,155),new Dollar.Point(134,159),new Dollar.Point(131,161),new Dollar.Point(124,166),new Dollar.Point(121,166),new Dollar.Point(117,166),new Dollar.Point(114,167),new Dollar.Point(112,166),new Dollar.Point(114,164),new Dollar.Point(116,163),new Dollar.Point(118,163),new Dollar.Point(120,162),new Dollar.Point(122,163),new Dollar.Point(125,164),new Dollar.Point(127,165),new Dollar.Point(129,166),new Dollar.Point(130,168),new Dollar.Point(129,171),new Dollar.Point(127,175),new Dollar.Point(125,179),new Dollar.Point(123,184),new Dollar.Point(121,190),new Dollar.Point(120,194),new Dollar.Point(119,199),new Dollar.Point(120,202),new Dollar.Point(123,207),new Dollar.Point(127,211),new Dollar.Point(133,215),new Dollar.Point(142,219),new Dollar.Point(148,220),new Dollar.Point(151,221)));
  	this.Templates[13] = new Template("right curly brace", new Array(new Dollar.Point(117,132),new Dollar.Point(115,132),new Dollar.Point(115,129),new Dollar.Point(117,129),new Dollar.Point(119,128),new Dollar.Point(122,127),new Dollar.Point(125,127),new Dollar.Point(127,127),new Dollar.Point(130,127),new Dollar.Point(133,129),new Dollar.Point(136,129),new Dollar.Point(138,130),new Dollar.Point(140,131),new Dollar.Point(143,134),new Dollar.Point(144,136),new Dollar.Point(145,139),new Dollar.Point(145,142),new Dollar.Point(145,145),new Dollar.Point(145,147),new Dollar.Point(145,149),new Dollar.Point(144,152),new Dollar.Point(142,157),new Dollar.Point(141,160),new Dollar.Point(139,163),new Dollar.Point(137,166),new Dollar.Point(135,167),new Dollar.Point(133,169),new Dollar.Point(131,172),new Dollar.Point(128,173),new Dollar.Point(126,176),new Dollar.Point(125,178),new Dollar.Point(125,180),new Dollar.Point(125,182),new Dollar.Point(126,184),new Dollar.Point(128,187),new Dollar.Point(130,187),new Dollar.Point(132,188),new Dollar.Point(135,189),new Dollar.Point(140,189),new Dollar.Point(145,189),new Dollar.Point(150,187),new Dollar.Point(155,186),new Dollar.Point(157,185),new Dollar.Point(159,184),new Dollar.Point(156,185),new Dollar.Point(154,185),new Dollar.Point(149,185),new Dollar.Point(145,187),new Dollar.Point(141,188),new Dollar.Point(136,191),new Dollar.Point(134,191),new Dollar.Point(131,192),new Dollar.Point(129,193),new Dollar.Point(129,195),new Dollar.Point(129,197),new Dollar.Point(131,200),new Dollar.Point(133,202),new Dollar.Point(136,206),new Dollar.Point(139,211),new Dollar.Point(142,215),new Dollar.Point(145,220),new Dollar.Point(147,225),new Dollar.Point(148,231),new Dollar.Point(147,239),new Dollar.Point(144,244),new Dollar.Point(139,248),new Dollar.Point(134,250),new Dollar.Point(126,253),new Dollar.Point(119,253),new Dollar.Point(115,253)));
  	this.Templates[14] = new Template("star", new Array(new Dollar.Point(75,250),new Dollar.Point(75,247),new Dollar.Point(77,244),new Dollar.Point(78,242),new Dollar.Point(79,239),new Dollar.Point(80,237),new Dollar.Point(82,234),new Dollar.Point(82,232),new Dollar.Point(84,229),new Dollar.Point(85,225),new Dollar.Point(87,222),new Dollar.Point(88,219),new Dollar.Point(89,216),new Dollar.Point(91,212),new Dollar.Point(92,208),new Dollar.Point(94,204),new Dollar.Point(95,201),new Dollar.Point(96,196),new Dollar.Point(97,194),new Dollar.Point(98,191),new Dollar.Point(100,185),new Dollar.Point(102,178),new Dollar.Point(104,173),new Dollar.Point(104,171),new Dollar.Point(105,164),new Dollar.Point(106,158),new Dollar.Point(107,156),new Dollar.Point(107,152),new Dollar.Point(108,145),new Dollar.Point(109,141),new Dollar.Point(110,139),new Dollar.Point(112,133),new Dollar.Point(113,131),new Dollar.Point(116,127),new Dollar.Point(117,125),new Dollar.Point(119,122),new Dollar.Point(121,121),new Dollar.Point(123,120),new Dollar.Point(125,122),new Dollar.Point(125,125),new Dollar.Point(127,130),new Dollar.Point(128,133),new Dollar.Point(131,143),new Dollar.Point(136,153),new Dollar.Point(140,163),new Dollar.Point(144,172),new Dollar.Point(145,175),new Dollar.Point(151,189),new Dollar.Point(156,201),new Dollar.Point(161,213),new Dollar.Point(166,225),new Dollar.Point(169,233),new Dollar.Point(171,236),new Dollar.Point(174,243),new Dollar.Point(177,247),new Dollar.Point(178,249),new Dollar.Point(179,251),new Dollar.Point(180,253),new Dollar.Point(180,255),new Dollar.Point(179,257),new Dollar.Point(177,257),new Dollar.Point(174,255),new Dollar.Point(169,250),new Dollar.Point(164,247),new Dollar.Point(160,245),new Dollar.Point(149,238),new Dollar.Point(138,230),new Dollar.Point(127,221),new Dollar.Point(124,220),new Dollar.Point(112,212),new Dollar.Point(110,210),new Dollar.Point(96,201),new Dollar.Point(84,195),new Dollar.Point(74,190),new Dollar.Point(64,182),new Dollar.Point(55,175),new Dollar.Point(51,172),new Dollar.Point(49,170),new Dollar.Point(51,169),new Dollar.Point(56,169),new Dollar.Point(66,169),new Dollar.Point(78,168),new Dollar.Point(92,166),new Dollar.Point(107,164),new Dollar.Point(123,161),new Dollar.Point(140,162),new Dollar.Point(156,162),new Dollar.Point(171,160),new Dollar.Point(173,160),new Dollar.Point(186,160),new Dollar.Point(195,160),new Dollar.Point(198,161),new Dollar.Point(203,163),new Dollar.Point(208,163),new Dollar.Point(206,164),new Dollar.Point(200,167),new Dollar.Point(187,172),new Dollar.Point(174,179),new Dollar.Point(172,181),new Dollar.Point(153,192),new Dollar.Point(137,201),new Dollar.Point(123,211),new Dollar.Point(112,220),new Dollar.Point(99,229),new Dollar.Point(90,237),new Dollar.Point(80,244),new Dollar.Point(73,250),new Dollar.Point(69,254),new Dollar.Point(69,252)));
  	this.Templates[15] = new Template("pigtail", new Array(new Dollar.Point(81,219),new Dollar.Point(84,218),new Dollar.Point(86,220),new Dollar.Point(88,220),new Dollar.Point(90,220),new Dollar.Point(92,219),new Dollar.Point(95,220),new Dollar.Point(97,219),new Dollar.Point(99,220),new Dollar.Point(102,218),new Dollar.Point(105,217),new Dollar.Point(107,216),new Dollar.Point(110,216),new Dollar.Point(113,214),new Dollar.Point(116,212),new Dollar.Point(118,210),new Dollar.Point(121,208),new Dollar.Point(124,205),new Dollar.Point(126,202),new Dollar.Point(129,199),new Dollar.Point(132,196),new Dollar.Point(136,191),new Dollar.Point(139,187),new Dollar.Point(142,182),new Dollar.Point(144,179),new Dollar.Point(146,174),new Dollar.Point(148,170),new Dollar.Point(149,168),new Dollar.Point(151,162),new Dollar.Point(152,160),new Dollar.Point(152,157),new Dollar.Point(152,155),new Dollar.Point(152,151),new Dollar.Point(152,149),new Dollar.Point(152,146),new Dollar.Point(149,142),new Dollar.Point(148,139),new Dollar.Point(145,137),new Dollar.Point(141,135),new Dollar.Point(139,135),new Dollar.Point(134,136),new Dollar.Point(130,140),new Dollar.Point(128,142),new Dollar.Point(126,145),new Dollar.Point(122,150),new Dollar.Point(119,158),new Dollar.Point(117,163),new Dollar.Point(115,170),new Dollar.Point(114,175),new Dollar.Point(117,184),new Dollar.Point(120,190),new Dollar.Point(125,199),new Dollar.Point(129,203),new Dollar.Point(133,208),new Dollar.Point(138,213),new Dollar.Point(145,215),new Dollar.Point(155,218),new Dollar.Point(164,219),new Dollar.Point(166,219),new Dollar.Point(177,219),new Dollar.Point(182,218),new Dollar.Point(192,216),new Dollar.Point(196,213),new Dollar.Point(199,212),new Dollar.Point(201,211)));
  	//
  	// The $1 Gesture Recognizer API begins here -- 3 methods
  	//
  	this.Recognize = function(points, useProtractor)
  	{
  		points = Resample(points, NumPoints);
  		var radians = IndicativeAngle(points);
  		points = RotateBy(points, -radians);
  		points = ScaleTo(points, SquareSize);
  		points = TranslateTo(points, Origin);
  		var vector = Vectorize(points); // for Protractor

  		var b = +Infinity;
  		var t = 0;
  		for (var i = 0; i < this.Templates.length; i++) // for each unistroke template
  		{
  			var d;
  			if (useProtractor) // for Protractor
  			{
  				d = OptimalCosineDistance(this.Templates[i].Vector, vector);
  			}
  			else // Golden Section Search (original $1)
  			{
  				d = DistanceAtBestAngle(points, this.Templates[i], -AngleRange, +AngleRange, AnglePrecision);
  			}
  			if (d < b)
  			{
  				b = d; // best (least) distance
  				t = i; // unistroke template
  			}
  		}
  		return new Result(this.Templates[t].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
  	};
  	//
  	// add/delete new templates
  	//
  	this.AddTemplate = function(name, points)
  	{
  		this.Templates[this.Templates.length] = new Template(name, points); // append new template
  		var num = 0;
  		for (var i = 0; i < this.Templates.length; i++)
  		{
  			if (this.Templates[i].Name == name)
  				num++;
  		}
  		return num;
  	}
  	this.DeleteUserTemplates = function()
  	{
  		this.Templates.length = NumTemplates; // clear any beyond the original set
  		return NumTemplates;
  	}
  }
  //
  // Private helper functions from this point down
  //
  function Resample(points, n)
  {
  	var I = PathLength(points) / (n - 1); // interval length
  	var D = 0.0;
  	var newpoints = new Array(points[0]);
  	for (var i = 1; i < points.length; i++)
  	{
  		var d = Distance(points[i - 1], points[i]);
  		if ((D + d) >= I)
  		{
  			var qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
  			var qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
  			var q = new Dollar.Point(qx, qy);
  			newpoints[newpoints.length] = q; // append new point 'q'
  			points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
  			D = 0.0;
  		}
  		else D += d;
  	}
  	// somtimes we fall a rounding-error short of adding the last point, so add it if so
  	if (newpoints.length == n - 1)
  	{
  		newpoints[newpoints.length] = new Dollar.Point(points[points.length - 1].X, points[points.length - 1].Y);
  	}
  	return newpoints;
  }
  function IndicativeAngle(points)
  {
  	var c = Centroid(points);
  	return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
  }	
  function RotateBy(points, radians) // rotates points around centroid
  {
  	var c = Centroid(points);
  	var cos = Math.cos(radians);
  	var sin = Math.sin(radians);

  	var newpoints = new Array();
  	for (var i = 0; i < points.length; i++)
  	{
  		var qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
  		var qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
  		newpoints[newpoints.length] = new Dollar.Point(qx, qy);
  	}
  	return newpoints;
  }
  function ScaleTo(points, size) // non-uniform scale; assumes 2D gestures (i.e., no lines)
  {
  	var B = BoundingBox(points);
  	var newpoints = new Array();
  	for (var i = 0; i < points.length; i++)
  	{
  		var qx = points[i].X * (size / B.Width);
  		var qy = points[i].Y * (size / B.Height);
  		newpoints[newpoints.length] = new Dollar.Point(qx, qy);
  	}
  	return newpoints;
  }			
  function TranslateTo(points, pt) // translates points' centroid
  {
  	var c = Centroid(points);
  	var newpoints = new Array();
  	for (var i = 0; i < points.length; i++)
  	{
  		var qx = points[i].X + pt.X - c.X;
  		var qy = points[i].Y + pt.Y - c.Y;
  		newpoints[newpoints.length] = new Dollar.Point(qx, qy);
  	}
  	return newpoints;
  }
  function Vectorize(points) // for Protractor
  {
  	var sum = 0.0;
  	var vector = new Array();
  	for (var i = 0; i < points.length; i++)
  	{
  		vector[vector.length] = points[i].X;
  		vector[vector.length] = points[i].Y;
  		sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
  	}
  	var magnitude = Math.sqrt(sum);
  	for (var i = 0; i < vector.length; i++)
  		vector[i] /= magnitude;
  	return vector;
  }
  function OptimalCosineDistance(v1, v2) // for Protractor
  {
  	var a = 0.0;
  	var b = 0.0;
  	for (var i = 0; i < v1.length; i += 2)
  	{
  		a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
                  b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
  	}
  	var angle = Math.atan(b / a);
  	return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
  }
  function DistanceAtBestAngle(points, T, a, b, threshold)
  {
  	var x1 = Phi * a + (1.0 - Phi) * b;
  	var f1 = DistanceAtAngle(points, T, x1);
  	var x2 = (1.0 - Phi) * a + Phi * b;
  	var f2 = DistanceAtAngle(points, T, x2);
  	while (Math.abs(b - a) > threshold)
  	{
  		if (f1 < f2)
  		{
  			b = x2;
  			x2 = x1;
  			f2 = f1;
  			x1 = Phi * a + (1.0 - Phi) * b;
  			f1 = DistanceAtAngle(points, T, x1);
  		}
  		else
  		{
  			a = x1;
  			x1 = x2;
  			f1 = f2;
  			x2 = (1.0 - Phi) * a + Phi * b;
  			f2 = DistanceAtAngle(points, T, x2);
  		}
  	}
  	return Math.min(f1, f2);
  }			
  function DistanceAtAngle(points, T, radians)
  {
  	var newpoints = RotateBy(points, radians);
  	return PathDistance(newpoints, T.Points);
  }	
  function Centroid(points)
  {
  	var x = 0.0, y = 0.0;
  	for (var i = 0; i < points.length; i++)
  	{
  		x += points[i].X;
  		y += points[i].Y;
  	}
  	x /= points.length;
  	y /= points.length;
  	return new Dollar.Point(x, y);
  }	
  function BoundingBox(points)
  {
  	var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
  	for (var i = 0; i < points.length; i++)
  	{
  		if (points[i].X < minX)
  			minX = points[i].X;
  		if (points[i].X > maxX)
  			maxX = points[i].X;
  		if (points[i].Y < minY)
  			minY = points[i].Y;
  		if (points[i].Y > maxY)
  			maxY = points[i].Y;
  	}
  	return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }	
  function PathDistance(pts1, pts2)
  {
  	var d = 0.0;
  	for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
  		d += Distance(pts1[i], pts2[i]);
  	return d / pts1.length;
  }
  function PathLength(points)
  {
  	var d = 0.0;
  	for (var i = 1; i < points.length; i++)
  		d += Distance(points[i - 1], points[i]);
  	return d;
  }		
  function Distance(p1, p2)
  {
  	var dx = p2.X - p1.X;
  	var dy = p2.Y - p1.Y;
  	return Math.sqrt(dx * dx + dy * dy);
  }
  function Deg2Rad(d) { return (d * Math.PI / 180.0); }
  function Rad2Deg(r) { return (r * 180.0 / Math.PI); }
  
})();

