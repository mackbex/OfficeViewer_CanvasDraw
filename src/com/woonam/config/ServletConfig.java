package com.woonam.config;

import java.io.File;
import java.io.IOException;
import java.io.PrintStream;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import com.woonam.connect.SocketConnect;
import com.woonam.log4j2.CustomConfigurationFactory;
import com.woonam.log4j2.LogScheduler;
import com.woonam.util.Profile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.core.config.ConfigurationFactory;

import com.woonam.util.Common;
import org.apache.logging.log4j.core.config.Order;
import org.apache.logging.log4j.status.StatusData;
import org.apache.logging.log4j.status.StatusLogger;

@WebListener
public class ServletConfig implements ServletContextListener {

    private Common m_C = new Common();
//    private Profile m_profile = null;
    LogScheduler LS = null;

    public void contextInitialized(ServletContextEvent event) {

        String rootPath 	= m_C.getRootPath(event.getServletContext());

        try {
            LogManager.getLogger(this.getClass());
            StatusLogger statusLogger = StatusLogger.getLogger();
            if (statusLogger.getStatusData().size() > 0) {
                System.out.println(
                        "Logged %d messages\n" +
                        statusLogger.getStatusData().size()
                );
                // Investigate List<StatusData> if you want
                for(StatusData data : statusLogger.getStatusData()) {
                    System.out.println(
                            "    Level %s message: %s\n" +
                            data.getLevel() +
                            data.getMessage().getFormattedMessage()
                    );
                }
                System.out.println("FATAL ERROR :: FAILED TO INIT LOG. CONTEXT WILL BE TERMINATED.. ");
                new ShutdownTask(event).start();
            }
        }
        catch (Exception e) {
            System.out.println("FATAL ERROR :: FAILED TO INIT LOG. CONTEXT WILL BE TERMINATED.. ");
            System.out.println(e.getMessage());
            new ShutdownTask(event).start();
           // throw new RuntimeException();
        }

        LS =  new LogScheduler(rootPath);
        if(LS.run()) {
            ConfigurationFactory.setConfigurationFactory(new CustomConfigurationFactory());
        }
        else {
            System.out.println("FATAL ERROR :: FAILED TO INIT LOG. CONTEXT WILL BE TERMINATED.. ");
            new ShutdownTask(event).start();
        }
    }
    public void contextDestroyed(ServletContextEvent event) {
        LS.shutdown();

    }
}


/**Shutdown WAS**/
class ShutdownTask extends Thread {

    private Common m_C = new Common();
    private ServletContextEvent e = null;

    public ShutdownTask(ServletContextEvent event) {
        this.e = event;
    }
//    private Profile m_profile = null;

    @Override
    public void run() {
        try {
            Profile profile = new Profile(m_C.getRootPath(e.getServletContext()) + File.separator + "conf" + File.separator + "conf.ini");
            int shutdownPort = Integer.parseInt(profile.getString("WAS_INFO","SHUTDOWN_PORT","8015"));
            SocketConnect s = new SocketConnect("127.0.0.1", shutdownPort);

            PrintStream os = new PrintStream(s.getOutputStream());
            os.println(profile.getString("WAS_INFO","COMMAND","8015"));
            s.close();

            System.out.println("SHUTTING DOWN SERVER ...");

        } catch (Exception e) {
            System.out.println(e.getMessage());
            System.out.println(" :::FAILED TO SHUT DOWN SERVER::: ");
            throw new RuntimeException();
        }
    }
}
