Event Planner - rule project demonstration
=======================

This project demonstrates certain aspects of building and testing a project in Red Hat Decision Manager

Included is a script and example requests to test the project after it is deployed on a kie-server in the folder 'requests'

Process
Create project 'event-planner'

Create Data objects
	Guest
		String name
		String party
		int age
		String entree
		String dessert
		Boolean peanutAllergy
		List<String> doorPrize
		String meatPreference
	Table
		String name
		List<Guest> guests
	Event
		int tableSize

Modify all get[list] methods (like table.getGuests()) to create a new list of the current list is null
eg. 
	public java.util.List<com.demos.event_planner.Guest> getGuests() {
		if (null == this.guests) {
			this.guests = new java.util.ArrayList<>();
		}
		return this.guests;
	}

create DT set-meal with condition columns
	has peanut allergy = [true|false]
	preference = $preference
and action columns
	Guest.entree = $entree
	Guest.dessert = $dessert
and ruleflow-group "set-meals"	

Note: if you create the DT action columns using the 'Set the value of a field' wizard. it will not use the modify() command in the rule code. This can cause an issue for later rules. Instead I used 'Add an action BRL fragment'
It could be beneficial to do this the first way and then explain after the rules are created why they're not working correctly

deploy project, test with command
	`./test.sh set-meals.json`

create 3 new rules for seating guests to table all with the ruleflow-group 'seat-guests'
	create-table-for-guest
		creates a new table for any guests that don't already have a table for their party
	move-guest-to-table
		moves a guest to a table for their party that has an open seat
	join-small-tables
		join two tables where the combined amount of guests is less than or equal to the max table size

TODO: when i tried to use the guided editor to create the move-guest-to-table I was getting an issue and had to change it to DRL instead. I need to go back and try to remember why that was. If i can fix it to use Guided Rules I will. Otherwise it could be used to show where a strait DRL file can come in handy

deploy project, test with command
	`./test.sh seat-guests.json`

create a business process 'plan-event'
create two business-rule tasks to run the rule-flow groups set-meals and seat-guests
TODO: look into having a switch here to check for an event object with maxTableSize, and then either contrain table size or not with later rules

deploy project, test with command
	`./test.sh small-request.json` or `./test.sh large-request.json`

TODO: implement door-prizes as a utility class that will choose some prizes for the guests. Implement DRL file to use this utility class
	implement a rule to use a door-prize query when a guest leaves (using entry points)