
# Event Planner - rule project demonstration

This project demonstrates certain aspects of building and testing a project in Red Hat Decision Manager. Included is a script and example requests to test the project after it is deployed on a kie-server in the folder 'requests'
## Cloning required projects
1. Create a new folder for the Decision Manager installer and the event-planner projects
`mkdir AD364 && cd AD364`
2. Save the location of this folder for future reference
`echo "export AD364_HOME=$(pwd)" >> ~/.bashrc`
`source ~/.bashrc`
3. clone the **[rhdm7-install-demo](https://github.com/jbossdemocentral/rhdm7-install-demo)** project which we will use to create a standalone decision manager server
`git clone https://github.com/jbossdemocentral/rhdm7-install-demo`
4. clone the **[AD364-apps](https://github.com/jbossdemocentral/rhdm7-install-demo)** project which contains the event-planner projects that we will import into Decision Manager
`git clone -b myarbrou/event-planner https://github.com/RedHatTraining/AD364-apps`
## Installing DM standalone
1.  Move into the rhdm7-install-demo project and inspect the directory structure. You should see 3 directories (docs, installs, support) as well as the init.sh install script
`cd $AD364_HOME/rhdm7-install-demo`
`ls`
2. Using a browser, log into Red Hat and download the following 3 install files for the EAP server, the DM server and kie-server respectively. Place these downloaded files into the $AD364_HOME/rhdm7-install-demo/installs directory
   - [jboss-eap-7.3.0.zip](https://access.redhat.com/jbossnetwork/restricted/softwareDownload.html?softwareId=80101)
   - [rhdm-7.9.0-decision-central-eap7-deployable.zip](https://access.redhat.com/jbossnetwork/restricted/softwareDownload.html?softwareId=89821)
   - [rhdm-7.9.0-kie-server-ee8.zip](https://access.redhat.com/jbossnetwork/restricted/softwareDownload.html?softwareId=89831)
3. Run the install script to unpack the zips and install the Decision Manager server. When it is finished you should see an out reading 'Red Hat Decision Manager 7.9.0 setup complete' along with instructions on tarting the server and logging into the web console
`cd $AD364_HOME/rhdm7-install-demo && ./init.sh`
4. Save the location of the server home directory for future use
`echo "export JBOSS_HOME=$(pwd)/target/jboss-eap-7.3" >> ~/.bashrc`
`source ~/.bashrc`
6. (Optional) Set your own credentials if you would like to use something other than the default dmAdmin/redhatdm1!
`$JBOSS_HOME/bin/add-user.sh -a -r ApplicationRealm -u <user> -p <password> -ro analyst,admin,manager,user,kie-server,kiemgmt,rest-all --silent`
7. Start the decision manager server. If you are planning to connect to this server from another computer on your network use the '-b 0.0.0.0' switch to open up the listener to external IP addresses
`$JBOSS_HOME/bin/standalone.sh -b 0.0.0.0`
8. Open a new terminal window.
9. Connect to the EAP server using the JBoss Command Line Interface
`$JBOSS_HOME/bin/jboss-cli.sh --connect`
10. Tell the JSON marshaller for the EAP server to print dates to a human readable format
`/system-property=org.kie.server.json.format.date:add(value=true)`
11. Create a new file handler to output listener events
`/subsystem=logging/file-handler=listeners_log:add(file={"path"=>"listeners.log", "relative-to"=>"jboss.server.log.dir"})`
12.  Create 3 new logging categories for the customer kie listeners that do not route to the root logger
`/subsystem=logging/logger=org.kie.api.event.rule.RuleRuntimeEventListener:add(level=DEBUG, use-parent-handlers=false)`
`/subsystem=logging/logger=org.kie.api.event.process.ProcessEventListener:add(level=DEBUG, use-parent-handlers=false)`
`/subsystem=logging/logger=org.kie.api.event.rule.AgendaEventListener:add(level=DEBUG, use-parent-handlers=false)`
13. Add the newly created file handler to the kie listener categories so that they print to a separate file
`/subsystem=logging/logger=org.kie.api.event.rule.RuleRuntimeEventListener:add-handler(name="listeners_log")`
`/subsystem=logging/logger=org.kie.api.event.process.ProcessEventListener:add-handler(name="listeners_log")`
`/subsystem=logging/logger=org.kie.api.event.rule.AgendaEventListener:add-handler(name="listeners_log")`
14. Exit the JBoss CLI
`exit`

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
`mkdir $AD364_HOME/rhdm-working-copy && cd $AD364_HOME/rhdm-working-copy`
6. Move to the AD364-apps/event-planner/Projects directory
`cd $AD364_HOME/AD364-apps/event-planner/Projects/`
7. For each project: clone the DM project down to the working copy, add the files from AD364-apps to the working copy, commit, and push back to DM
```
for dir in *;
    do git clone 'http://dmAdmin:redhatdm1!@localhost:8080/decision-central/git/EventPlanning/'$dir $AD364_HOME/rhdm-working-copy/$dir;
    cp -Rv $AD364_HOME/AD364-apps/event-planner/Projects/$dir $AD364_HOME/rhdm-working-copy/;
    cd $AD364_HOME/rhdm-working-copy/$dir;
    git add -A;
    git commit -m 'Adding Files';
    git push;
done
```
### Building the projects
DataObjects and Listeners do not deploy to containers for the REST API. They are only used as dependencies in the other 3 projects and so only need to be built and installed to the repository. The other three will need to be deployed
1. Open your favorite web browser and log into [Decision Central](http://localhost:8080/decision-central/)
2. Navigate to the EventPlanning namespace and open the DataObjects namespace
3. expand the dropdown next to the 'Build' button and click 'Build and Install'
4. Navigate to the Listeners project and again run 'Build and Install'
5. Navigate to the Dining project and click the 'Deploy' button to build, install, and deploy Dining to a new container
6. Navigate to the GoodieBags and OpenBar projects and click 'Deploy' on both

## Testing projects with REST API
### Required tools
Install [jq](https://stedolan.github.io/jq/) so that the testing script can parse the request and response payloads
`sudo yum install jq -y`
### Test script and request payloads
1. In the terminal navigate to the $AD364_HOME/AD364-apps/event-planner/Requests directory
`cd $AD364_HOME/AD364-apps/event-planner/Requests`
2. set test.sh to executable
`chmod +x test.sh`
3. Test the rules in the set-meals ruleflow-group
`./test.sh set-meals.json`
4. Test the rules in the seat-guests ruleflow-group
`./test.sh seat-guests.json`
4. Test the query in the Dining project
`./test.sh query.json`
5. Test the event-planner.plan-event process
`./test.sh small-request.json`
`./test.sh large-request.json`
6. Test the rules in the OpenBar project
`./test.sh bar.json`
6. Test the DMN in the GoodieBags project
`./testDmn.sh goodieBag.json`

## Cleanup
1. In the terminal window where the server is running. Press Ctrl-C to shutdown the server
2. Remove the $AD364_HOME directory
`rm -rf $AD364_HOME`
`sed -i "/^export JBOSS_HOME=/d" ~/.bashrc`
`sed -i "/^export AD364_HOME=/d" ~/.bashrc`
