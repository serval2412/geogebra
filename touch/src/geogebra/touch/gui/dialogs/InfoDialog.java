package geogebra.touch.gui.dialogs;

import geogebra.common.main.App;
import geogebra.common.main.Localization;
import geogebra.touch.FileManagerM;
import geogebra.touch.TouchApp;
import geogebra.touch.gui.CommonResources;
import geogebra.touch.gui.elements.StandardImageButton;
import geogebra.touch.model.GuiModel;
import com.google.gwt.event.dom.client.ClickEvent;
import com.google.gwt.event.dom.client.ClickHandler;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.PopupPanel;
import com.google.gwt.user.client.ui.VerticalPanel;

public class InfoDialog extends PopupPanel
{
	private StandardImageButton cancelButton = new StandardImageButton(CommonResources.INSTANCE.dialog_cancel());
	private StandardImageButton okButton = new StandardImageButton(CommonResources.INSTANCE.dialog_ok());
	private VerticalPanel dialogPanel;
	private HorizontalPanel buttonContainer;
	private Label title;
	String consTitle;
	private Localization loc;
	App app;
	FileManagerM fm;
	Runnable callback = null;
	private GuiModel guiModel;

	public InfoDialog(App app, FileManagerM fm, GuiModel guiModel)
	{
		super(true, true);
		this.app = app;
		this.loc = app.getLocalization();
		this.fm = fm;
		this.setGlassEnabled(true);
		this.dialogPanel = new VerticalPanel();
		this.title = new Label();
		this.guiModel = guiModel;

		addLabel();
		addButtons();

		this.add(this.dialogPanel);
		// FIXME the glass pane has z-index 20, we must go higher
		this.getElement().getStyle().setZIndex(42);
	}

	@Override
	public void show()
	{
		super.show();
		this.guiModel.setActiveDialog(this);
//		this.guiModel.showOption(this, OptionType.Dialog, null);
	}

	@Override
	public void hide()
	{
	  super.hide();
		this.guiModel.setActiveDialog(null);

//	  this.guiModel.closeOptions();
	}
	
	private void addLabel()
	{
		this.title.setText(this.loc.getMenu("DoYouWantToSaveYourChanges"));
		this.dialogPanel.add(this.title);
	}

	private void addButtons()
	{
		initCancelButton();
		initOKButton();

		this.buttonContainer = new HorizontalPanel();
		this.buttonContainer.setWidth("100%");
		this.buttonContainer.add(this.okButton);
		this.buttonContainer.add(this.cancelButton);

		this.dialogPanel.add(this.buttonContainer);
	}

	private void initCancelButton()
	{
		this.cancelButton.addDomHandler(new ClickHandler()
		{
			@Override
			public void onClick(ClickEvent event)
			{
				InfoDialog.this.hide();
				if (InfoDialog.this.callback != null)
				{
					InfoDialog.this.callback.run();
				}
				else
				{
					App.debug("no callback");
				}
			}
		}, ClickEvent.getType());
	}

	private void initOKButton()
	{
		this.okButton.addDomHandler(new ClickHandler()
		{

			@Override
			public void onClick(ClickEvent event)
			{
				// just save in stockStore - no changes of construction title
				InfoDialog.this.fm.saveFile(InfoDialog.this.consTitle, InfoDialog.this.app);
				InfoDialog.this.hide();
				if (InfoDialog.this.callback != null)
				{
					InfoDialog.this.callback.run();
				}
				else
				{
					App.debug("no callback");
				}
			}
		}, ClickEvent.getType());
	}

	public void showIfNeeded(TouchApp touchApp)
	{
		if (!touchApp.isSaved())
		{
			this.consTitle = touchApp.getConstructionTitle();
			show();
			super.center();
		}
		else
		{
			if (this.callback != null)
			{
				this.callback.run();
			}
		}
	}

	public void setLabels()
	{
		this.title.setText(this.loc.getMenu("DoYouWantToSaveYourChanges"));
	}

	public void setCallback(Runnable callback)
	{
		this.callback = callback;
	}
}