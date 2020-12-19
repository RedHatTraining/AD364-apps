
# Event Planner - rule project demonstration

This project demonstrates certain aspects of building and testing a project in Red Hat Decision Manager. Included is a script and example requests to test the project after it is deployed on a kie-server in the folder 'requests'
## Cloning required projects
1. Create a new folder for the Decision Manager installer and the event-planner projects
`mkdir AD364 && cd AD364`
2. Save the location of this folder for future reference
`echo "AD364_HOME=$(pwd)" >> ~/.bashrc`
`source ~/.bashrc`
3. clone the **[rhdm7-install-demo](https://github.com/jbossdemocentral/rhdm7-install-demo)** project which we will use to create a standalone decision manager server
`git clone https://github.com/jbossdemocentral/rhdm7-install-demo`
4. clone the **[AD364-apps](https://github.com/jbossdemocentral/rhdm7-install-demo)** project which contains the event-planner projects that we will import into Decision Manager
`git clone -b myarbrou/event-planner https://github.com/RedHatTraining/AD364-apps`
## Installing DM standalone
1.  Move into the rhdm7-install-demo project and inspect the directory structure. You should see 3 directories (docs, installs, support) as well as the init.sh install script
`cd rhdm7-install-demo`
`ls`
2. Using a browser, log into Red Hat and download the following 3 install files for the EAP server, the DM server and kie-server respectively. Place these downloaded files into the $AD364_HOME/rhdm7-install-demo/installs directory
   - [jboss-eap-7.3.0.zip](https://access.redhat.com/jbossnetwork/restricted/softwareDownload.html?softwareId=80101)
   - [rhdm-7.9.0-decision-central-eap7-deployable.zip](https://access.redhat.com/jbossnetwork/restricted/softwareDownload.html?softwareId=89821)
   - [rhdm-7.9.0-kie-server-ee8.zip](https://access.redhat.com/jbossnetwork/restricted/softwareDownload.html?softwareId=89831)
3. Run the install script to unpack the zips and install the Decision Manager server. When it is finished you should see an out reading 'Red Hat Decision Manager 7.9.0 setup complete' along with instructions on tarting the server and logging into the web console
`cd $AD364_HOME/rhdm7-install-demo && ./init.sh`
4. Save the location of the server home directory for future use
`echo "JBOSS_HOME=$(pwd)/target/jboss-eap-7.3" >> ~/.bashrc`
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
 6. In Projects window click the 'Import Project' button to open the 'Import Project' dialog.
 7. In the 'Import Project' dialog set the Repository URL to
`file://
### DataObjects project
The DataObjects project house all java code POJOs and Utility classes for the other projects with one caveat. The java classes that implement custom kie listeners are separated into their own project
Either create a new DataObjects project and import the java files into it, or import the java project provided on github
#### Importing the project from github
Click on the 'Import project' or Click the dropdown next to the 'Add Project' button and select 'Import Project' to open the Import Project dialog

## Testing projects
### Required tools
curl
jq
### test.sh script and payloads
Process<br/>
1. Create project 'event-planner'

2. Create Data objects
- Guest
  - String name
  - String party
  - int age
  - String entree
  - String dessert
  - Boolean peanutAllergy
  - List<String> doorPrize
  - String meatPreference
- Table
  - String name
  - List<Guest> guests
- Event
  - int tableSize

3. Modify all get[list] methods (like table.getGuests()) to create a new list of the current list is null
eg. 
```java
    public java.util.List<com.demos.event_planner.Guest> getGuests() {
        if (null == this.guests) {
            this.guests = new java.util.ArrayList<>();
        }
        return this.guests;
    }
```

4. create DT set-meal with condition columns
- has peanut allergy = [true|false]
- preference = $preference<br/>
and action columns
- Guest.entree = $entree
- Guest.dessert = $dessert<br/>
and ruleflow-group "set-meals"

Note: if you create the DT action columns using the 'Set the value of a field' wizard. it will not use the modify() command in the rule code. This can cause an issue for later rules. Instead I used 'Add an action BRL fragment'
It could be beneficial to do this the first way and then explain after the rules are created why they're not working correctly

5. deploy project, test with command<br/>
	`./test.sh set-meals.json`

6. create 3 new rules for seating guests to table all with the ruleflow-group 'seat-guests'
- create-table-for-guest
  - creates a new table for any guests that don't already have a table for their party
- move-guest-to-table
  - moves a guest to a table for their party that has an open seat
- join-small-tables
  - join two tables where the combined amount of guests is less than or equal to the max table size

TODO: when i tried to use the guided editor to create the move-guest-to-table I was getting an issue and had to change it to DRL instead. I need to go back and try to remember why that was. If i can fix it to use Guided Rules I will. Otherwise it could be used to show where a strait DRL file can come in handy

7. deploy project, test with command<br/>
	`./test.sh seat-guests.json`

8. create a business process 'plan-event'
9. create two business-rule tasks to run the rule-flow groups set-meals and seat-guests<br/>
TODO: look into having a switch here to check for an event object with maxTableSize, and then either contrain table size or not with later rules

10. deploy project, test with command<br/>
	`./test.sh small-request.json` or `./test.sh large-request.json`

TODO: implement door-prizes as a utility class that will choose some prizes for the guests. Implement DRL file to use this utility class
	implement a rule to use a door-prize query when a guest leaves (using entry points)
