

# Event Planner - rule project demonstration

This project demonstrates certain aspects of building and testing a project in Red Hat Decision Manager. Included is a script and example requests to test the project after it is deployed on a kie-server in the folder 'requests'
## Cloning required projects
1. Create a new folder for the Decision Manager installer and the event-planner projects
<br/>`mkdir AD364 && cd AD364`
2. Save the location of this folder for future reference
<br/>`echo "export AD364_HOME=$(pwd)" >> ~/.bashrc`
<br/>`source ~/.bashrc`
3. clone the **[rhdm7-install-demo](https://github.com/jbossdemocentral/rhdm7-install-demo)** project which we will use to create a standalone decision manager server
<br/>`git clone https://github.com/jbossdemocentral/rhdm7-install-demo`
4. clone the **[AD364-apps](https://github.com/jbossdemocentral/rhdm7-install-demo)** project which contains the event-planner projects that we will import into Decision Manager
<br/>`git clone -b myarbrou/event-planner https://github.com/RedHatTraining/AD364-apps`
## Installing DM standalone
1.  Move into the rhdm7-install-demo project and inspect the directory structure. You should see 3 directories (docs, installs, support) as well as the init.sh install script
<br/>`cd $AD364_HOME/rhdm7-install-demo`
<br/>`ls`
2. Using a browser, log into Red Hat and download the following 3 install files for the EAP server, the DM server and kie-server respectively. Place these downloaded files into the $AD364_HOME/rhdm7-install-demo/installs directory
   - [jboss-eap-7.3.0.zip](https://access.redhat.com/jbossnetwork/restricted/softwareDownload.html?softwareId=80101)
   - [rhdm-7.9.0-decision-central-eap7-deployable.zip](https://access.redhat.com/jbossnetwork/restricted/softwareDownload.html?softwareId=89821)
   - [rhdm-7.9.0-kie-server-ee8.zip](https://access.redhat.com/jbossnetwork/restricted/softwareDownload.html?softwareId=89831)
3. Run the install script to unpack the zips and install the Decision Manager server. When it is finished you should see an out reading 'Red Hat Decision Manager 7.9.0 setup complete' along with instructions on tarting the server and logging into the web console
<br/>`cd $AD364_HOME/rhdm7-install-demo && ./init.sh`
4. Save the location of the server home directory for future use
<br/>`echo "export JBOSS_HOME=$(pwd)/target/jboss-eap-7.3" >> ~/.bashrc`
<br/>`source ~/.bashrc`
5. Start the decision manager server. If you are planning to connect to this server from another computer on your network use the '-b 0.0.0.0' switch to open up the listener to external IP addresses
<br/>`$JBOSS_HOME/bin/standalone.sh -b 0.0.0.0`
6. Open a new terminal window.
7. Connect to the EAP server using the JBoss Command Line Interface
<br/>`$JBOSS_HOME/bin/jboss-cli.sh --connect`
8. Tell the JSON marshaller for the EAP server to print dates to a human readable format
<br/>`/system-property=org.kie.server.json.format.date:add(value=true)`
9. Create a new file handler to output listener events
<br/>`/subsystem=logging/file-handler=listeners_log:add(file={"path"=>"listeners.log", "relative-to"=>"jboss.server.log.dir"})`
10.  Create 3 new logging categories for the customer kie listeners that do not route to the root logger
```
/subsystem=logging/logger=org.kie.api.event.rule.RuleRuntimeEventListener:add(level=DEBUG, use-parent-handlers=false)
/subsystem=logging/logger=org.kie.api.event.process.ProcessEventListener:add(level=DEBUG, use-parent-handlers=false)
/subsystem=logging/logger=org.kie.api.event.rule.AgendaEventListener:add(level=DEBUG, use-parent-handlers=false)
```
11. Add the newly created file handler to the kie listener categories so that they print to a separate file
```
/subsystem=logging/logger=org.kie.api.event.rule.RuleRuntimeEventListener:add-handler(name="listeners_log")
/subsystem=logging/logger=org.kie.api.event.process.ProcessEventListener:add-handler(name="listeners_log")
/subsystem=logging/logger=org.kie.api.event.rule.AgendaEventListener:add-handler(name="listeners_log")
```
12. Exit the JBoss CLI
<br/>`exit`

## Creating Projects on Decision Manager
### Creating EventPlanning space
1. Open your favorite web browser and log into [Decision Central](http://localhost:8080/decision-central/) with the user and password you provided earlier, or use the default dmAdmin/redhatdm1!
2. Click Design to reach the Spaces window
3. Click the Add Space button at the top right to create a new space
4. In the 'Add Space' dialog, set name to 'EventPlanning' and the description to 'Projects for organizing an event' and click Add
5. Back in the spaces window click the EventPlanning space to open the Projects windows to the EventPlanning namespace
### Creating the projects
1. In Projects window click the 'Add Project' to open the Add Project dialog
2. In the Add Project dialog set the name to 'DataObjects' and the description to 'Java objects for event planner projects' and click Add
3. Move back to the projects page by clicking EventPlanning in the breadcrumb menu
4. Click 'Add Project' again and do the same thing 4 more times until you have the following projects

| Name | Description |
|--|--|
| DataObjects | Java objects for EventPlanning projects |
| Dining      | Rules that seat guests and decide meals |
| Listeners   | Listener objects to EventPlanning projects |
| OpenBar     | Rules for distributing drinks to guests |
| GoodieBags  | DMN for deciding what a guest gets in their goodie bag |

5. In a terminal window create a new folder to clone the DM projects to a working copy
<br/>`mkdir $AD364_HOME/rhdm-working-copy && cd $AD364_HOME/rhdm-working-copy`
6. For each project: clone the DM project down to the working copy, add the files from AD364-apps to the working copy, commit, and push back to DM
```bash
for p in DataObjects Dining Listeners OpenBar GoodieBags;
    do git clone 'http://dmAdmin:redhatdm1!@localhost:8080/decision-central/git/EventPlanning/'$p $AD364_HOME/rhdm-working-copy/$p;
    cp -Rv $AD364_HOME/AD364-apps/event-planner/$p $AD364_HOME/rhdm-working-copy/;
    cd $AD364_HOME/rhdm-working-copy/$p;
    git add -A;
    git commit -m 'Adding Files';
    git push;
done
```
### Building the projects
DataObjects and Listeners do not deploy to containers for the REST API. They are only used as dependencies in the other 3 projects and so only need to be built and installed to the repository. The other three will need to be deployed
1. Open your favorite web browser and log into [Decision Central](http://localhost:8080/decision-central/)
2. Navigate to the EventPlanning namespace and open the DataObjects namespace
3. Expand the dropdown next to the 'Build' button and click 'Build and Install'
4. Navigate to the Listeners project and again run 'Build and Install'
5. Navigate to the Dining project and click the 'Deploy' button to build, install, and deploy Dining to a new container
6. Navigate to the GoodieBags and OpenBar projects and click 'Deploy' on both

## Testing projects with REST API
### Required tools
If you do not already have it, install [jq](https://stedolan.github.io/jq/) so that the testing script can parse the request and response payloads
<br/>`sudo yum install jq -y`
### Test script and request payloads
1. In the terminal navigate to the $AD364_HOME/AD364-apps/event-planner/Requests directory
<br/>`cd $AD364_HOME/AD364-apps/event-planner/Requests`
2. set test.sh and dmnTest.sh to executable
<br/>`chmod +x test.sh dmnTest.sh`
3. Test the rules in the set-meals ruleflow-group
<br/>`./test.sh set-meals.json`
4. Test the rules in the seat-guests ruleflow-group
<br/>`./test.sh seat-guests.json`
5. Test the query in the Dining project
<br/>`./test.sh query.json`
6. Test the event-planner.plan-event process
<br/>`./test.sh small-request.json`
<br/>`./test.sh large-request.json`
7. Test the rules in the OpenBar project
<br/>`./test.sh bar.json`
8. Test the DMN in the GoodieBags project
<br/>`./dmnTest.sh goodieBag.json`
9. If you get the error
> Can not set java.util.Map field org.kie.server.api.model.dmn.DMNContextKS.dmnContext to com.eventplanning.dataobjects.Guest

set this system property and restart the server
<br/>`$JBOSS_HOME/bin/jboss-cli.sh --connect '/system-property=org.drools.server.filter.classes:add(value=true)'`  

## Cleanup
1. In the terminal window where the server is running. Press Ctrl-C to shutdown the server
2. Remove the $AD364_HOME directory
<br/>`rm -rf $AD364_HOME`
3. Remove artifacts from the .m2 repo
<br/>`rm -rf ~/.m2/repository/com/eventplanning`
4. Remove lines added to .bashrc
<br/>`sed -i "/^export JBOSS_HOME=/d" ~/.bashrc`
<br/>`sed -i "/^export AD364_HOME=/d" ~/.bashrc`
