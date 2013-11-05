/* 
GeoGebra - Dynamic Mathematics for Everyone
http://www.geogebra.org

This file is part of GeoGebra.

This program is free software; you can redistribute it and/or modify it 
under the terms of the GNU General Public License as published by 
the Free Software Foundation.

 */

package geogebra.common.kernel.algos;

import geogebra.common.awt.GColor;
import geogebra.common.kernel.Construction;
import geogebra.common.kernel.StringTemplate;
import geogebra.common.kernel.arithmetic.ExpressionNodeConstants.StringType;
import geogebra.common.kernel.commands.Commands;
import geogebra.common.kernel.geos.GeoElement;
import geogebra.common.kernel.geos.GeoList;
import geogebra.common.kernel.geos.GeoText;
import geogebra.common.kernel.geos.TextProperties;
import geogebra.common.util.StringUtil;

import com.google.gwt.regexp.shared.MatchResult;
import com.google.gwt.regexp.shared.RegExp;

/**
 * Algo for TableText[matrix], TableText[matrix,args]
 *
 */
public class AlgoTableText extends AlgoElement {

	private GeoList geoList; // input
	private GeoText text; // output
	private GeoText args; // input

	private GeoList[] geoLists;

	private StringBuffer sb = new StringBuffer();

	private enum Alignment { VERTICAL,HORIZONTAL}

	// style variables
	private Alignment alignment;
	private boolean verticalLines, horizontalLines;
	private boolean verticalLinesJustEdges, horizontalLinesJustEdges;
	private String justification, openBracket, closeBracket, openString,
			closeString;
	private int columns;
	private int rows;

	// getters for style variables (used by EuclidianStyleBar)
	
	
	public Alignment getAlignment() {
		return alignment;
	}

	public boolean isVerticalLines() {
		return verticalLines;
	}

	public boolean isHorizontalLines() {
		return horizontalLines;
	}

	/**
	 * @return justification l, r or c (just of first column if they have different alignment)
	 */
	public String getJustification() {
		return justification.charAt(0)+"";
	}

	public String getOpenSymbol() {
		return openString;
	}

	public String getCloseSymbol() {
		return closeString;
	}

	/**
	 * @param cons construction
	 * @param label label for output
	 * @param geoList input matrix
	 * @param args table formating, see parseArgs()
	 */
	public AlgoTableText(Construction cons, String label, GeoList geoList, GeoText args) {
		this(cons, geoList, args);
		text.setLabel(label);
	}
	/**
	 * @param cons construction
	 * @param geoList input matrix
	 * @param args table formating, see parseArgs()
	 */
	AlgoTableText(Construction cons, GeoList geoList, GeoText args) {
		super(cons);
		this.geoList = geoList;
		this.args = args;

		text = new GeoText(cons);
		
		text.setFormulaType(StringType.LATEX);
		text.setLaTeX(true, false);

		text.setIsTextCommand(true); // stop editing as text

		setInputOutput();
		compute();

		// set sans-serif LaTeX default
		text.setSerifFont(false);
	}

	@Override
	public Commands getClassName() {
		return Commands.TableText;
	}

	@Override
	protected void setInputOutput() {
		if (args == null) {
			input = new GeoElement[1];
			input[0] = geoList;
		} else {
			input = new GeoElement[2];
			input[0] = geoList;
			input[1] = args;
		}

		super.setOutputLength(1);
		super.setOutput(0, text);
		setDependencies(); // done by AlgoElement
	}

	/**
	 * @return resulting text
	 */
	public GeoText getResult() {
		return text;
	}
	
	// get the lrc from middle of ABCDlrcEFGH
	private final static RegExp matchLRC = RegExp.compile("([^lrc]*)([lrc]*)([^lrc]*)");


	private void parseArgs() {

		int tableColumns = geoList.size();

		// set defaults
		alignment = Alignment.HORIZONTAL;
		verticalLines = false;
		horizontalLines = false;
		justification = "l";
		// need an open & close together, so can't use ""
		openBracket = "\\left.";
		closeBracket = "\\right.";

		if (args != null) {
			String optionsStr = args.getTextString();
			if (optionsStr.indexOf("v") > -1) {
				alignment = Alignment.VERTICAL; // vertical table
			}
			
			if (optionsStr.indexOf("|") > -1 && optionsStr.indexOf("||") == -1) {
				verticalLines = true;
			}
			
			if (optionsStr.indexOf("_") > -1) {
				horizontalLines = true; // vertical table
			}
			
			verticalLinesJustEdges = optionsStr.indexOf("/") > -1;
			horizontalLinesJustEdges = optionsStr.indexOf("-") > -1;
		
			MatchResult matcher = matchLRC.exec(optionsStr);
			justification = matcher.getGroup(2);
			if ("".equals(justification)) {
				justification = "l";
			}
			
			if (optionsStr.indexOf("||||") > -1) {
				openBracket = "\\left| \\left|";
				closeBracket = "\\right| \\right|";
				openString = "||";
				closeString = "||";
			} else if (optionsStr.indexOf("||") > -1) {
				openBracket = "\\left|";
				closeBracket = "\\right|";
				openString = "|";
				closeString = "|";
			} else if (optionsStr.indexOf('(') > -1) {
				openBracket = "\\left(";
				openString = "(";
			} else if (optionsStr.indexOf('[') > -1) {
				openBracket = "\\left[";
				openString = "[";

			} else if (optionsStr.indexOf('{') > -1) {
				openBracket = "\\left\\{";
				openString = "{";
			}

			if (optionsStr.indexOf(')') > -1) {
				closeBracket = "\\right)";
				closeString = ")";
			} else if (optionsStr.indexOf(']') > -1) {
				closeBracket = "\\right]";
				closeString = "]";
			} else if (optionsStr.indexOf('}') > -1) {
				closeBracket = "\\right\\}";
				closeString = "}";
			}

		} else if (geoList.get(tableColumns - 1).isGeoText()) {

			// support for older files before the fix
			GeoText options = (GeoText) geoList.get(tableColumns - 1);
			String optionsStr = options.getTextString();
			
			if (optionsStr.indexOf("h") > -1) {
				alignment = Alignment.HORIZONTAL; // horizontal table
			}
			
			MatchResult matcher = matchLRC.exec(optionsStr);
			justification = matcher.getGroup(2);
			if ("".equals(justification)) {
				justification = "l";
			}

		}
		
    	if (openBracket.equals("\\left.") && closeBracket.equals("\\right.")) {
    		openBracket = "";
    		closeBracket = "";
    	}

	}

	@Override
	public final void compute() {

		columns = geoList.size();

		if (!geoList.isDefined() || columns == 0) {
			text.setTextString("");
			return;
			// throw new MyError(app, app.getError("InvalidInput"));
		}

		parseArgs();

		// support for older files before the fix
		if (geoList.get(columns - 1).isGeoText()) {
			columns--;
		}

		if (columns == 0) {
			text.setTextString("");
			return;
			// throw new MyError(app, app.getError("InvalidInput"));
		}

		if (geoLists == null || geoLists.length < columns) {
			geoLists = new GeoList[columns];
		}

		rows = 0;

		for (int c = 0; c < columns; c++) {
			GeoElement geo = geoList.get(c);
			if (!geo.isGeoList()) {
				text.setTextString("");
				return;
				// throw new MyError(app,
				// loc.getPlain("SyntaxErrorAisNotAList",geo.toValueString()));
			}
			geoLists[c] = (GeoList) geoList.get(c);
			if (geoLists[c].size() > rows)
				rows = geoLists[c].size();
		}

		if (rows == 0) {
			text.setTextString("");
			return;
			// throw new MyError(app, app.getError("InvalidInput"));
		}



		sb.setLength(0);

		StringTemplate tpl = text.getStringTemplate();
		
		if (tpl.getStringType().equals(StringType.MATHML)) {
			mathml(tpl);			
		} else {
			if (kernel.getApplication().isHTML5Applet()) {
				latexMQ(tpl);
			} else {
				latex(tpl);
			}
		}
		// Application.debug(sb.toString());
		text.setTextString(sb.toString());
	}

	private void mathml(StringTemplate tpl) {
		
		if (alignment == Alignment.VERTICAL) {


			sb.append("<matrix>");
			for (int r = 0; r < rows; r++) {
				sb.append("<matrixrow>");
				for (int c = 0; c < columns; c++) {
					addCellMathML(c, r, tpl);
				}
				sb.append("</matrixrow>"); 
			}
			sb.append("</matrix>");

		} else { // alignment == HORIZONTAL

			// TableText[{11.1,322,3.11},{4,55,666,7777,88888},{6.11,7.99,8.01,9.81},{(1,2)},"c()"]

			sb.append("<matrix>");
			for (int c = 0; c < columns; c++) {
				sb.append("<matrixrow>");
				for (int r = 0; r < rows; r++) {
					addCellMathML(c, r, tpl);
				}
				sb.append("</matrixrow>");
			}
			sb.append("</matrix>");
		}
		
	}

	private void latex(StringTemplate tpl) {
		
		// surround in { } to make eg this work:
		// FormulaText["\bgcolor{ff0000}"+TableText[matrix1]]
		sb.append('{');

		sb.append(openBracket);
		sb.append("\\begin{array}{");

		if (alignment == Alignment.VERTICAL) {

			for (int c = 0; c < columns; c++) {
				if (verticalLines &&
						(!verticalLinesJustEdges || c == 0)) {
					sb.append("|");
				}
				sb.append(getJustification(c)); // "l", "r" or "c"
			}
			if (verticalLines) {
				sb.append("|");
			}
			
			sb.append("}");

			if (horizontalLines) {
				sb.append("\\hline ");
			}

			for (int r = 0; r < rows; r++) {
				for (int c = 0; c < columns; c++) {
					boolean finalCell = (c == columns - 1);
					addCellLaTeX(c, r, finalCell, tpl);
				}
				sb.append(" \\\\ "); // newline in LaTeX ie \\
				
				if (horizontalLines &&
						(!horizontalLinesJustEdges || r == rows - 1)) {
					sb.append("\\hline ");
				}
			}

		} else { // alignment == HORIZONTAL

			for (int c = 0; c < rows; c++) {
				if (verticalLines &&
						(!verticalLinesJustEdges || c == 0)) {
					sb.append("|");
				}
				
				sb.append(getJustification(c)); // "l", "r" or "c"
			}
			if (verticalLines) {
				sb.append("|");
			}
			
			sb.append("}");

			if (horizontalLines) {
				sb.append("\\hline ");
			}
			
			// TableText[{11.1,322,3.11},{4,55,666,7777,88888},{6.11,7.99,8.01,9.81},{(1,2)},"c()"]

			for (int c = 0; c < columns; c++) {
				for (int r = 0; r < rows; r++) {
					boolean finalCell = (r == rows - 1);
					addCellLaTeX(c, r, finalCell, tpl);
				}
				sb.append(" \\\\ "); // newline in LaTeX ie \\
				if (horizontalLines &&
						(!horizontalLinesJustEdges || c == columns - 1)) {
					sb.append("\\hline ");
				}
			}
		}

		sb.append("\\end{array}");
		sb.append(closeBracket);

		// surround in { } to make eg this work:
		// FormulaText["\bgcolor{ff0000}"+TableText[matrix1]]
		sb.append('}');
		}

	/**
	 * 
	 * @param c column/row
	 * @return 'l', 'r', 'c' for left/right/center
	 */
	private char getJustification(int c) {
		
		if (c < 0 || c >= justification.length()) {
			// default, if user passes "c" then use for all columns
			return justification.charAt(0);
		}
		
		return justification.charAt(c);
	}

	private void latexMQ(StringTemplate tpl) {
		// surround in { } to make eg this work:
		// FormulaText["\bgcolor{ff0000}"+TableText[matrix1]]
		sb.append('{');

		sb.append(openBracket);
		sb.append(" \\ggbtable{ ");

		if (alignment == Alignment.VERTICAL) {

			for (int r = 0; r < rows; r++) {
				if (!horizontalLines) {
					sb.append("\\ggbtr{");
				} else if (!horizontalLinesJustEdges) {
					sb.append("\\ggbtrl{");
				} else if (r == 0) {
					sb.append("\\ggbtrlt{");
				} else if (r == rows-1) {
					sb.append("\\ggbtrlb{");
				} else {
					sb.append("\\ggbtr{");
				}
				for (int c = 0; c < columns; c++) {
					String jc = String.valueOf(getJustification(c)).toUpperCase();
					if (!verticalLines) {
						sb.append("\\ggbtd"+jc+"{");
					} else if (!verticalLinesJustEdges) {
						sb.append("\\ggbtdl"+jc+"{");
					} else if (c == 0) {
						sb.append("\\ggbtdll"+jc+"{");
					} else if (c == columns-1) {
						sb.append("\\ggbtdlr"+jc+"{");
					} else {
						sb.append("\\ggbtd"+jc+"{");
					}
					addCellLaTeX(c, r, true, tpl);
					sb.append("}");
				}
				sb.append("}");
			}

		} else { // alignment == HORIZONTAL

			for (int c = 0; c < columns; c++) {
				if (!horizontalLines) {
					sb.append("\\ggbtr{");
				} else if (!horizontalLinesJustEdges) {
					sb.append("\\ggbtrl{");
				} else if (c == 0) {
					sb.append("\\ggbtrlt{");
				} else if (c == columns-1) {
					sb.append("\\ggbtrlb{");
				} else {
					sb.append("\\ggbtr{");
				}
				for (int r = 0; r < rows; r++) {
					String jc = String.valueOf(getJustification(r)).toUpperCase();
					if (!verticalLines) {
						sb.append("\\ggbtd"+jc+"{");
					} else if (!verticalLinesJustEdges) {
						sb.append("\\ggbtdl"+jc+"{");
					} else if (r == 0) {
						sb.append("\\ggbtdll"+jc+"{");
					} else if (r == rows-1) {
						sb.append("\\ggbtdlr"+jc+"{");
					} else {
						sb.append("\\ggbtd"+jc+"{");
					}
					addCellLaTeX(c, r, true, tpl);
					sb.append("}");
				}
				sb.append("}");
			}
		}

		sb.append("} ");
		sb.append(closeBracket);

		// surround in { } to make eg this work:
		// FormulaText["\bgcolor{ff0000}"+TableText[matrix1]]
		sb.append('}');
	}

	private void addCellLaTeX(int c, int r, boolean finalCell,StringTemplate tpl) {
		if (geoLists[c].size() > r) { // check list has an element at this
										// position
			GeoElement geo1 = geoLists[c].get(r);
			
			GColor col = geo1.getObjectColor();

			// check isLabelSet() so that eg TableText[{{1, 2, 3}}] isn't green
			if (GColor.black.equals(col) || !geo1.isLabelSet()) {
				col = null;
			}
			
			if (col != null) {
					sb.append("\\textcolor{#");
					sb.append(StringUtil.toHexString(col));
					sb.append("}{");
			}

			// replace " " and "" with a hard space (allow blank columns/rows)
			String text1 = geo1.toLaTeXString(false,tpl);
			
			if (" ".equals(text1) || "".equals(text1)) {
				text1 = "\\;"; // problem with JLaTeXMath, was "\u00a0";
			}
			
			// make sure latex isn't wrapped in \text{}
			if (((geo1 instanceof TextProperties && !((TextProperties)geo1).isLaTeXTextCommand()) &&
					(!(geo1 instanceof GeoText) || !((GeoText)geo1).isLaTeX()))
					
					// check for "raw" LaTeX
					// eg TableText[{"\frac{2}{3}","2","3"},{"4","5","6"}]
					&& text1.indexOf(" ") > -1
					&& text1.indexOf("^") == -1
					&& text1.indexOf("{") == -1
					&& text1.indexOf("}") == -1
					&& text1.indexOf("+") == -1
					&& text1.indexOf("-") == -1
					&& text1.indexOf("\\") == -1
					
					
					) {
				
				
				
				
				sb.append("\\text{"); // preserve spaces
				sb.append(text1);
				sb.append("}");
				

			} else {
				sb.append(text1);
			}
			
			if (col != null) {
				sb.append('}');
			}
		}
		if (!finalCell)
			sb.append("&"); // separate columns
	}

	private void addCellMathML(int c, int r,StringTemplate tpl) {
		if (geoLists[c].size() > r) { // check list has an element at this
										// position
			GeoElement geo1 = geoLists[c].get(r);

			// replace " " and "" with a hard space (allow blank columns/rows)
			String textGeo = geo1.toLaTeXString(false,tpl);
			if (textGeo.startsWith("<apply>")) {
				sb.append(textGeo);
			} else if (StringUtil.isNumber(textGeo)) {
				sb.append("<cn>");
				sb.append(textGeo);
				sb.append("</cn>");
			} else {
				sb.append("<ci>");
				sb.append(textGeo);
				sb.append("</ci>");
			} 
		}
	}

	@Override
	public boolean isLaTeXTextCommand() {
		return true;
	}

	// TODO Consider locusequability

}
