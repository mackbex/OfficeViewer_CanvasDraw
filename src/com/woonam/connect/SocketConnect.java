package com.woonam.connect;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.*;
import java.net.Socket;



public class SocketConnect extends Socket
{
	public Socket socket=null;
	ObjectInputStream ininmsgeam = null;
	public OutputStream os = null;
	public OutputStreamWriter osw = null;
	private BufferedReader reader = null;
	private String msg;
	private String inmsg;
	private Logger logger = null;


	public SocketConnect() {
		this.logger = LogManager.getLogger(SocketConnect.class);
	}

	public SocketConnect(String ip, int port) throws IOException {
		super(ip, port);
		this.logger = LogManager.getLogger(SocketConnect.class);
	}

	public String request(String ip, int port, String outputstream, String ResultFlag, String strCharset)
	{

		try 
		{
			msg = outputstream;
			socket	=	new Socket(ip, port);
				
			os = socket.getOutputStream();
			osw = new OutputStreamWriter(os,strCharset);
				
			osw.write(msg);
			osw.flush();
				
			reader = new BufferedReader(new InputStreamReader(socket.getInputStream(),strCharset));
	            
			inmsg = (String) reader.readLine();
					
			 int ResultCnt =  Integer.parseInt(inmsg.substring(2,14));
				
			 if(!ResultFlag.equals("full"))			inmsg = inmsg.substring(14,inmsg.length());		
				
		} 
		catch (Exception e) 
		{
			logger.error("request Exception", e);
		}
		finally
		{
			try 
			{
				reader.close();
				socket.close();
				os.close();
				osw.close();
			} 
			catch (Exception e) 
			{
				logger.error("request closing Exception", e);
			}
		}
		return inmsg;
	}
}
