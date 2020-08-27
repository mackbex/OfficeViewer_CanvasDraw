package com.woonam.template;

import java.awt.Color;
import java.io.File;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.woonam.connect.AgentConnect;
import com.woonam.util.Common;
import com.woonam.util.Profile;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;


public class CashReceipt extends TemplateImpl{

	private String m_TemplatePath = null;
	private JsonObject obj_cashInfo = null;
	private JsonArray m_arImageInfo = new JsonArray();
	private int m_nCurPage 					= 0;
	private long m_nFileTotalSize 			= 0;
	private String m_workPath = null;
	private Logger logger = null;

	private Profile m_Profile = null;
	private Common m_C = new Common();

	public CashReceipt(Profile profile) {
		this.m_Profile = profile;
		this.logger = LogManager.getLogger(CashReceipt.class);
	}

	@Override
	public JsonObject run(JsonObject obj_data, String bgPath, String workPath) {

		JsonObject obj_res = null;
		if(m_C.isBlank(bgPath)) return null;

		this.obj_cashInfo = obj_data;
		this.m_TemplatePath = bgPath;
		this.m_workPath = workPath;

		TemplateTool tool = new TemplateTool(m_C.Get_RootPathForJava() + File.separator + m_TemplatePath + File.separator + "00.jpg");
		if(tool != null) {
			tool.setFontStyle("NanumGothic", tool.NORMAL, 18);
			tool.setFontColor(new Color(0,0,0));

			File file = new File(bgPath);
			if(!file.exists())
			{
				file.mkdirs();
			}

			obj_res =  Draw(tool);
		}

		return obj_res;
	}


	//Draw Templete data
	private JsonObject Draw(TemplateTool tool)
	{
		JsonObject obj_res = new JsonObject();
		tool.setFontStyle("NanumGothic", tool.NORMAL, 40);

		boolean isDivided = false;

		try
		{


			//사업자등록번호
			String strBizrNo = this.obj_cashInfo.get("BIZ_NO").getAsString();
			strBizrNo = strBizrNo.replaceAll("(\\d{3})(\\d{2})(\\d{5})", "$1-$2-$3");
			tool.DrawText(strBizrNo, 188, 400);

			//거래일시
			String strUseDT = this.obj_cashInfo.get("APPR_DATE").getAsString().substring(2, this.obj_cashInfo.get("APPR_DATE").getAsString().length());
			String strUseTM = this.obj_cashInfo.get("APPR_TIME").getAsString();

			String strFormatted = strUseDT.replaceAll("(\\d{2})(\\d{2})(\\d{2})", "$1.$2.$3") +"."+ strUseTM.replaceAll("(\\d{2})(\\d{2})(\\d{2})", "$1.$2.$3");
			tool.DrawText(strFormatted, 188, 740);

			//결제구분
			String strTranFG = this.obj_cashInfo.get("APPR_ST").getAsString();
			tool.DrawText(strTranFG, 188, 916);

			//공급금액
			String strSPPRCAmt = this.obj_cashInfo.get("AMOUNT").getAsString();
			strSPPRCAmt = strSPPRCAmt.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strSPPRCAmt, 1000, 840, 1420, 930, tool.RIGHT);

			//세액금액
			String strTAXAmt = this.obj_cashInfo.get("TAX").getAsString();
			strTAXAmt = strTAXAmt.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strTAXAmt, 1000, 990, 1420, 1060, tool.RIGHT);

			//봉사금액
			String strTIPAmt = this.obj_cashInfo.get("TIPS").getAsString();
			strTIPAmt = strTIPAmt.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strTIPAmt, 1000, 1120, 1420, 1190, tool.RIGHT);

			//합계금액
			String strTotalAmt = this.obj_cashInfo.get("TOTAL").getAsString();
			strTotalAmt = strTotalAmt.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strTotalAmt, 1000, 1250, 1420, 1320, tool.RIGHT);

			//승인번호
			String strAprvlNo = this.obj_cashInfo.get("APPR_NO").getAsString();
			tool.DrawText(strAprvlNo, 730, 1440);

			//가명점 명
			String strFRCSName = this.obj_cashInfo.get("MERCH_NAME").getAsString();
			tool.DrawText(strFRCSName, 188, 1600);

			//가맹점 사용자등록번호
			String strSPLRNo = this.obj_cashInfo.get("MERCH_BIZ_NO").getAsString();
			strSPLRNo = strSPLRNo.replaceAll("(\\d{3})(\\d{2})(\\d{5})", "$1-$2-$3");
			tool.DrawText(strSPLRNo, 188, 1820, 670, 1940, tool.CENTER);

//			//대표자 명
//			String strCEOName = this.m_imageData.GetString("CEO_NM");
//			tool.DrawText(strCEOName, 340, 524, 468, 544, tool.CENTER);
//
//			//가명점 주소
//			String strADDR = this.m_imageData.GetString("BASE_ADDR");
//			tool.DrawMultiLineText(strADDR, 238, 584, 460, 664,200,0,2, tool.LEFT);

		}
		catch(Exception e)
		{
			logger.error("Cash - Draw", e, 9);
			//	this.m_resImgInfo = null;
			return null;
		}

		savePage(tool);

		obj_res.addProperty("TOTAL_SIZE", m_nFileTotalSize / 1024);
		obj_res.add("IMG_INFO", m_arImageInfo);
		obj_res.addProperty("CONVERT_KEY", obj_cashInfo.get("ConvertKey").getAsString());
		obj_res.addProperty("SDOC_NAME", "현금영수증");
		return obj_res;
	}

	private void savePage(TemplateTool tool) {

		//	String strImagePath = m_Profile.getString("WAS_INFO", "TEMP_DIR", m_C.Get_RootPathForJava() + File.separator + "temp");

		File path = new File(m_workPath);
		if(!path.exists()) {
			path.mkdirs();
		}

		String docIRN = m_C.getIRN("");
		StringBuffer sbImgPath = new StringBuffer();
		sbImgPath.append(m_workPath);
		sbImgPath.append(File.separator);
		sbImgPath.append(docIRN);
		sbImgPath.append(".J2K");

		long lFileSize = tool.saveImageFile(sbImgPath.toString(), tool.IMAGE_JPG);
		m_nFileTotalSize += lFileSize;
		JsonObject objJsonItem = new JsonObject();
		//-IMPORTANT- save background image size to use on upload slip.
		objJsonItem.addProperty("WIDTH", tool.getBackgroundWidth());
		objJsonItem.addProperty("HEIGHT", tool.getBackgroundHeight());
		objJsonItem.addProperty("SIZE", lFileSize / 1024);
		objJsonItem.addProperty("INDEX", m_nCurPage);
		objJsonItem.addProperty("DOC_IRN", docIRN);
		objJsonItem.addProperty("PATH", sbImgPath.toString());
		objJsonItem.addProperty("NAME", "법인카드");
		m_arImageInfo.add(objJsonItem);
	}


}

