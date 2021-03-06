package org.geogebra.desktop.gui;

import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.util.Locale;

import javax.swing.text.JTextComponent;

import org.geogebra.common.gui.inputfield.AltKeys;
import org.geogebra.common.util.StringUtil;
import org.geogebra.common.util.Unicode;
import org.geogebra.common.util.debug.Log;
import org.geogebra.desktop.main.AppD;

/*
 * Michael Borcherds
 * 
 * Implements KeyListener
 * adds support for alt-codes (and alt-shift-) for special characters
 * (ctrl on MacOS)
 */

public class GeoGebraKeys implements KeyListener {

	private static StringBuilder altCodes = new StringBuilder();

	private boolean altPressed;

	private AppD app;

	public GeoGebraKeys(AppD app) {
		this.app = app;
	}

	public void keyPressed(KeyEvent e) {
		// swallow eg ctrl-a ctrl-b ctrl-p on Mac
		if (AppD.MAC_OS && e.isControlDown())
			e.consume();
		// Application.debug("keyPressed");
	}

	public void keyTyped(KeyEvent e) {

		// Application.debug("keyTyped"+e.getKeyChar());
		if (AppD.isAltDown(e)) {
			if (!altPressed) {
				altCodes.setLength(0);
				// Application.debug("alt pressed");
			}
			altPressed = true;
		} else {
			if (altCodes.length() > 0) {

				// intercept wrong character and replace with correct Alt-code
				char insertStr = (char) Integer.parseInt(altCodes.toString());
				JTextComponent comp = (JTextComponent) e.getComponent();
				int pos = comp.getCaretPosition();
				String oldText = comp.getText();
				StringBuilder sb = new StringBuilder();
				sb.append(oldText.substring(0, pos));
				sb.append(insertStr);
				sb.append(oldText.substring(pos));
				comp.setText(sb.toString());

				comp.setCaretPosition(pos + 1);
				e.consume();

			}

			altPressed = false;
			altCodes.setLength(0);
		}

		// we don't want to trap AltGr
		// as it is used eg for entering {[}] is some locales
		// NB e.isAltGraphDown() doesn't work
		if (e.isAltDown() && e.isControlDown())
			return;

	}

	public void keyReleased(KeyEvent e) {

		// when decimal comma typed on numeric keypad on eg German keyboard,
		// replace with .

		if ((e.getKeyCode() == KeyEvent.VK_SEPARATOR || e.getKeyChar() == ',')
				&& e.getKeyLocation() == KeyEvent.KEY_LOCATION_NUMPAD) {
			Log.warn("replacing decimal , with decimal .");
			JTextComponent comp = (JTextComponent) e.getComponent();
			int pos = comp.getCaretPosition();
			String oldText = comp.getText();
			StringBuilder sb = new StringBuilder();

			// pos - 1 to remove ","
			sb.append(oldText.substring(0, pos - 1));

			sb.append(".");
			sb.append(oldText.substring(pos));
			comp.setText(sb.toString());

			comp.setCaretPosition(pos);
			e.consume();

		}

		// Application.debug("keyReleased");
		// ctrl pressed on Mac
		// or alt on Windows
		boolean modifierKeyPressed = AppD.isAltDown(e);

		if (modifierKeyPressed) {

			String insertStr = "";

			// works nicely for alt or ctrl pressed (Windows/Mac)
			String keyString = KeyEvent.getKeyText(e.getKeyCode()).toLowerCase(
					Locale.US);

			// Application.debug(KeyEvent.getKeyText(e.getKeyCode()).toLowerCase().charAt(0)+"");
			// Application.debug(e+"");
			// Application.debug(keyString);

			// support for alt codes
			if (e.isAltDown()
					&& e.getKeyLocation() == KeyEvent.KEY_LOCATION_NUMPAD) {
				char c = e.getKeyChar();

				// make sure it's not eg alt-*
				if (c >= '0' && c <= '9')
					altCodes.append(e.getKeyChar());
				// Application.debug("alt:"+altCodes);
			}

			boolean numpad = e.getKeyLocation() == KeyEvent.KEY_LOCATION_NUMPAD;

			// Numeric keypad numbers eg NumPad-8, NumPad *
			if (!e.isAltDown() && numpad)
				keyString = e.getKeyChar() + "";

			Log.debug("Key pressed " + StringUtil.toHexString(e.getKeyChar())
					+ " " + keyString);

			// workaround for different Java versions!!
			if (keyString.equals("minus"))
				keyString = "-";
			else if (keyString.equals("plus"))
				keyString = "+";
			else if (keyString.equals("comma"))
				keyString = ",";
			else if (keyString.equals("period"))
				keyString = ".";
			else if (keyString.equals("equals"))
				keyString = "=";
			else if (keyString.length() > 1)
				Log.debug("Unknown keyString: " + keyString);

			switch (e.getKeyChar()) {
			// workaround for shifted characters:
			// (different in different locales)
			case '+':
			case '*':
			case '=':
			case '-':
			case '>':
			case '<':
				// Italian keyboard, keyString="unknown keycode: 0x0" for these
				// two
				// French keyboard, keyString= eg "2" (so we need to leave it
				// for Alt-2 to work)
			case Unicode.eGrave:
			case Unicode.eAcute:
				if (keyString.length() > 1) {
					keyString = e.getKeyChar() + "";
				}
			}

			// don't want to act on eg "Shift"
			if (keyString.length() == 1) {

				insertStr = AltKeys.getAltSymbols(
						Character.toUpperCase(keyString.charAt(0)),
						e.isShiftDown(), false);

				if (insertStr == null) {
					insertStr = "";
				}

			}

			// insert into the text component
			if (!insertStr.equals("")) {
				JTextComponent comp = (JTextComponent) e.getComponent();
				int pos = comp.getCaretPosition();

				// if we have a DynamicTextInputPane then using setText to
				// insert will destroy any dynamic objects, so use its
				// insertString method instead.
				if (comp instanceof DynamicTextInputPane) {
					((DynamicTextInputPane) comp).insertString(pos, insertStr,
							null);
				} else
				// all other cases use setText
				{
					String oldText = comp.getText();
					StringBuilder sb = new StringBuilder();
					sb.append(oldText.substring(0, pos));
					sb.append(insertStr);
					sb.append(oldText.substring(pos));
					comp.setText(sb.toString());
					comp.setCaretPosition(pos + insertStr.length());
				}

				e.consume();
			}
		}
	}
}
