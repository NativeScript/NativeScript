import observable = require("data/observable");
import dialogs = require("ui/dialogs");
var everlive = require("./lib/everlive");

var el = new everlive("mzacGkKPFlZUfbMq");


// UPLOAD Sessions
var sessionsStatic = [
    {
        title: "Registration",
        start: new Date(2015, 4, 3, 8, 30),
        end: new Date(2015, 4, 3, 9, 30),
        room: ""
    }, {
        title: "NativeScript Deep Dive",
        start: new Date(2015, 4, 3, 9, 30),
        end: new Date(2015, 4, 3, 12, 30),
        room: "Workshop Room 1"
    }, {
        title: "Smart Design for Smartphones",
        start: new Date(2015, 4, 3, 9, 30),
        end: new Date(2015, 4, 3, 12, 30),
        room: "Workshop Room 2"
    }
    , {
        title: "Modern .NET Apps!",
        start: new Date(2015, 4, 3, 9, 30),
        end: new Date(2015, 4, 3, 12, 30),
        room: "Workshop Room 3"
    }, {
        title: "Telerik Sitefinity as a Data Integration Platform",
        start: new Date(2015, 4, 3, 9, 30),
        end: new Date(2015, 4, 3, 12, 30),
        room: "Workshop Room 4"
    }, {
        title: "Lunch",
        start: new Date(2015, 4, 3, 9, 30),
        end: new Date(2015, 4, 3, 12, 30),
        room: ""
    }, {
        title: "NativeScript Deep Dive",
        start: new Date(2015, 4, 3, 13, 30),
        end: new Date(2015, 4, 3, 16, 30),
        room: "Workshop Room 1"
    }, {
        title: "Smart Design for Smartphones",
        start: new Date(2015, 4, 3, 13, 30),
        end: new Date(2015, 4, 3, 16, 30),
        room: "Workshop Room 2"
    }, {
        title: "Responsive Apps with Telerik DevCraft",
        start: new Date(2015, 4, 3, 13, 30),
        end: new Date(2015, 4, 3, 16, 30),
        room: "Workshop Room 3"
    }, {
        title: "ASP .NET MVC Development in Telerik Sitefinity",
        start: new Date(2015, 4, 3, 13, 30),
        end: new Date(2015, 4, 3, 16, 30),
        room: "Workshop Room 4"
    }, {
        title: "Registration",
        start: new Date(2015, 4, 4, 7, 30),
        end: new Date(2015, 4, 4, 9, 0),
        room: ""
    }, {
        title: "Telerik Keynote",
        start: new Date(2015, 4, 4, 9, 0),
        end: new Date(2015, 4, 4, 10, 30),
        room: "General Session"
    }, {
        title: "A Lap Around NativeScript",
        start: new Date(2015, 4, 4, 10, 45),
        end: new Date(2015, 4, 4, 11, 30),
        room: "Conference Room 1"
    }, {
        title: "Kendo UI Building Blocks",
        start: new Date(2015, 4, 4, 10, 45),
        end: new Date(2015, 4, 4, 11, 30),
        room: "Conference Room 2"
    }, {
        title: "CRUD with ASP.NET MVC, Web API, EF and Kendo UI",
        start: new Date(2015, 4, 4, 10, 45),
        end: new Date(2015, 4, 4, 11, 30),
        room: "Conference Room 3"
    }, {
        title: "Best Practices for Understanding and Implementing Website Project Requirements",
        start: new Date(2015, 4, 4, 10, 45),
        end: new Date(2015, 4, 4, 11, 30),
        room: "Conference Room 4"
    }, {
        title: "Getting Started with ScreenBuilder",
        start: new Date(2015, 4, 4, 11, 45),
        end: new Date(2015, 4, 4, 12, 30),
        room: "Conference Room 1"
    }, {
        title: "Getting Started with AngularJS",
        start: new Date(2015, 4, 4, 11, 45),
        end: new Date(2015, 4, 4, 12, 30),
        room: "Conference Room 2"
    }, {
        title: "Zero to Hipster with the M.I.K.E. Stack",
        start: new Date(2015, 4, 4, 11, 45),
        end: new Date(2015, 4, 4, 12, 30),
        room: "Conference Room 3"
    }, {
        title: "Content Meets Commerce, Email and Analytics to Build the New Data-Driven Marketing Machine",
        start: new Date(2015, 4, 4, 11, 45),
        end: new Date(2015, 4, 4, 12, 30),
        room: "Conference Room 4"
    }, {
        title: "Lunch",
        start: new Date(2015, 4, 4, 12, 30),
        end: new Date(2015, 4, 4, 13, 30),
        room: ""
    }, {
        title: "Hybrid vs Native vs Web: Which is Right for Me?",
        start: new Date(2015, 4, 4, 13, 30),
        end: new Date(2015, 4, 4, 14, 15),
        room: "Conference Room 1"
    }, {
        title: "AngularJS Directives For Kendo UI",
        start: new Date(2015, 4, 4, 13, 30),
        end: new Date(2015, 4, 4, 14, 15),
        room: "Conference Room 2"
    }, {
        title: "Using Kendo UI in SharePoint/Office 365",
        start: new Date(2015, 4, 4, 13, 30),
        end: new Date(2015, 4, 4, 14, 15),
        room: "Conference Room 3"
    }, {
        title: "Develop the Next Generation of Content-Driven Mobile Apps",
        start: new Date(2015, 4, 4, 13, 30),
        end: new Date(2015, 4, 4, 14, 15),
        room: "Conference Room 3"
    }, {
        title: "PM Break",
        start: new Date(2015, 4, 4, 14, 15),
        end: new Date(2015, 4, 4, 14, 30),
        room: ""
    }, {
        title: "AppBuilder in 45 Minutes",
        start: new Date(2015, 4, 4, 14, 30),
        end: new Date(2015, 4, 16, 15, 15),
        room: "Conference Room 1"
    }, {
        title: "Mastering JavaScript",
        start: new Date(2015, 4, 4, 14, 30),
        end: new Date(2015, 4, 16, 15, 15),
        room: "Conference Room 2"
    }, {
        title: "Building Mobile Apps with Visual Studio",
        start: new Date(2015, 4, 4, 14, 30),
        end: new Date(2015, 4, 16, 15, 15),
        room: "Conference Room 3"
    }, {
        title: "Building a CRM Portal in 60 Minutes",
        start: new Date(2015, 4, 4, 14, 30),
        end: new Date(2015, 4, 16, 15, 15),
        room: "Conference Room 4"
    }, {
        title: "NativeScript Extensibility",
        start: new Date(2015, 4, 4, 15, 30),
        end: new Date(2015, 4, 4, 16, 15),
        room: "Conference Room 1"
    }, {
        title: "There's a Cordova Plugin for that!",
        start: new Date(2015, 4, 4, 15, 30),
        end: new Date(2015, 4, 4, 16, 15),
        room: "Conference Room 2"
    }, {
        title: "AngularJS and Kendo UI",
        start: new Date(2015, 4, 4, 15, 30),
        end: new Date(2015, 4, 4, 16, 15),
        room: "Conference Room 3"
    }, {
        title: "Continuous Delivery and Telerik Sitefinity",
        start: new Date(2015, 4, 4, 15, 30),
        end: new Date(2015, 4, 4, 16, 15),
        room: "Conference Room 4"
    }, {
        title: "Telerik Leadership Panel - Q&A",
        start: new Date(2015, 4, 4, 16, 30),
        end: new Date(2015, 4, 4, 17, 15),
        room: "Conference Room 1"
    }, {
        title: "Accelerate your Agile Adoption",
        start: new Date(2015, 4, 4, 16, 30),
        end: new Date(2015, 4, 4, 17, 15),
        room: "Conference Room 2"
    }, {
        title: "No Kidding, Real World Tester/Developer Collaboration",
        start: new Date(2015, 4, 4, 16, 30),
        end: new Date(2015, 4, 4, 17, 15),
        room: "Conference Room 3"
    }, {
        title: "Sitefinity",
        start: new Date(2015, 4, 4, 16, 30),
        end: new Date(2015, 4, 4, 17, 15),
        room: "Conference Room 4"
    }, {
        title: "Attendee Appreciation Party",
        start: new Date(2015, 4, 4, 19, 0),
        end: new Date(2015, 4, 4, 22, 30),
        room: ""
    }, {
        title: "Registration",
        start: new Date(2015, 4, 5, 8, 0),
        end: new Date(2015, 4, 5, 9, 0),
        room: ""
    }, {
        title: "Sitefinity Keynote",
        start: new Date(2015, 4, 5, 9, 0),
        end: new Date(2015, 4, 5, 10, 30),
        room: "General Session"
    }, {
        title: "Introduction to Mobile Testing and Device Cloud",
        start: new Date(2015, 4, 5, 10, 45),
        end: new Date(2015, 4, 5, 11, 30),
        room: "Conference Room 1"
    }, {
        title: "Data is Beautiful with Kendo UI DataViz",
        start: new Date(2015, 4, 5, 10, 45),
        end: new Date(2015, 4, 5, 11, 30),
        room: "Conference Room 2"
    }, {
        title: "Mastering How to Visualize Data in ASP.NET MVC",
        start: new Date(2015, 4, 5, 10, 45),
        end: new Date(2015, 4, 5, 11, 30),
        room: "Conference Room 3"
    }, {
        title: "Using Sitefinity to Power Web 3.0 Experiences",
        start: new Date(2015, 4, 5, 10, 45),
        end: new Date(2015, 4, 5, 11, 30),
        room: "Conference Room 4"
    }, {
        title: "Building Offline-Ready Mobile Apps",
        start: new Date(2015, 4, 5, 11, 45),
        end: new Date(2015, 4, 5, 12, 30),
        room: "Conference Room 1"
    }, {
        title: "Kendo UI Mobile: What It Can And Can't Do For You",
        start: new Date(2015, 4, 5, 11, 45),
        end: new Date(2015, 4, 5, 12, 30),
        room: "Conference Room 2"
    }, {
        title: "ASP.NET with Telerik UI!",
        start: new Date(2015, 4, 5, 11, 45),
        end: new Date(2015, 4, 5, 12, 30),
        room: "Conference Room 3"
    }, {
        title: "Cross-Channel Data Integration with Digital Experience Cloud",
        start: new Date(2015, 4, 5, 11, 45),
        end: new Date(2015, 4, 5, 12, 30),
        room: "Conference Room 4"
    }, {
        title: "Lunch",
        start: new Date(2015, 4, 5, 12, 30),
        end: new Date(2015, 4, 5, 13, 30),
        room: ""
    }, {
        title: "Performance Tuning Your Mobile Web Apps",
        start: new Date(2015, 4, 5, 13, 30),
        end: new Date(2015, 4, 5, 14, 15),
        room: "Conference Room 1"
    }, {
        title: "Improving Applications with Telerik Analytics",
        start: new Date(2015, 4, 5, 13, 30),
        end: new Date(2015, 4, 5, 14, 15),
        room: "Conference Room 2"
    }, {
        title: "Reporting vs Dashboards vs UI Data Apps",
        start: new Date(2015, 4, 5, 13, 30),
        end: new Date(2015, 4, 5, 14, 15),
        room: "Conference Room 3"
    }, {
        title: "Modern MVC and Front-End Development with Telerik Sitefinity",
        start: new Date(2015, 4, 5, 13, 30),
        end: new Date(2015, 4, 5, 14, 15),
        room: "Conference Room 4"
    }, {
        title: "PM Break",
        start: new Date(2015, 4, 5, 14, 15),
        end: new Date(2015, 4, 5, 14, 30),
        room: ""
    }, {
        title: "Telerik Native Mobile UI for iOS and Android",
        start: new Date(2015, 4, 5, 14, 30),
        end: new Date(2015, 4, 17, 15, 15),
        room: "Conference Room 1"
    }, {
        title: "IoT and the Telerik Platform",
        start: new Date(2015, 4, 5, 14, 30),
        end: new Date(2015, 4, 17, 15, 15),
        room: "Conference Room 2"
    }, {
        title: "Debugging with Fiddler",
        start: new Date(2015, 4, 5, 14, 30),
        end: new Date(2015, 4, 17, 15, 15),
        room: "Conference Room 3"
    }, {
        title: "Anticipating & Planning of Peak Online Traffic for Professional Football's Biggest Games",
        start: new Date(2015, 4, 5, 14, 30),
        end: new Date(2015, 4, 17, 15, 15),
        room: "Conference Room 4"
    }, {
        title: "Building a Mobile App API using MongoDB and Node.js",
        start: new Date(2015, 4, 5, 15, 30),
        end: new Date(2015, 4, 5, 16, 15),
        room: "Conference Room 1"
    }, {
        title: "Advanced Kendo UI",
        start: new Date(2015, 4, 5, 15, 30),
        end: new Date(2015, 4, 5, 16, 15),
        room: "Conference Room 2"
    }, {
        title: "Building Touch Apps with UI for WPF",
        start: new Date(2015, 4, 5, 15, 30),
        end: new Date(2015, 4, 5, 16, 15),
        room: "Conference Room 3"
    }, {
        title: "Making the Most Out of Sitefinity Personalization",
        start: new Date(2015, 4, 5, 15, 30),
        end: new Date(2015, 4, 5, 16, 15),
        room: "Conference Room 4"
    }, {
        title: "Closing Keynote",
        start: new Date(2015, 4, 5, 16, 30),
        end: new Date(2015, 4, 5, 17, 15),
        room: "General Session"
    }];

var dataSessions = el.data('NextSessions');
for (var i = 0; i < sessionsStatic.length; i++) {
    dataSessions.create(sessionsStatic[i],
        function (data) {
            console.log("session added: " + JSON.stringify(data));
        },
        function (error) {
            console.log("error: " + error);
        });
}


// UPLOAD SPEAKERS
var speakersStatic = [
    {
        name: "Todd Anglin",
        title: "Vice President of Product Strategy",
        company: "Telerik",
        picture: "todd.png"
    },
    {
        name: "Aaron Mahimainathan",
        title: "Senior Vice President, Platform & Tools",
        company: "Telerik",
        picture: "aaron.png"
    },
    {
        name: "Burke Holland",
        title: "Director of Developer Relations",
        company: "Telerik",
        picture: "burke.png"
    },
    {
        name: "Brian Rinaldi",
        title: "Developer Content Manager",
        company: "Telerik",
        picture: "brian.png"
    },
    {
        name: "TJ VanToll",
        title: "Senior Developer Advocate",
        company: "Telerik",
        picture: "tj.png"
    },
    {
        name: "Jen Looper",
        title: "Developer Advocate",
        company: "Telerik",
        picture: "jen.png"
    },
    {
        name: "Brandon Satrom",
        title: "Director of Product Management",
        company: "Telerik",
        picture: "brandon.png"
    },
    {
        name: "Michael Crump",
        title: "Senior Developer Advocate",
        company: "Telerik",
        picture: "michael.png"
    },
    {
        name: "Sam Basu",
        title: "Developer Advocate",
        company: "Telerik",
        picture: "sam.png"
    },
    {
        name: "Svetla Yankova",
        title: "Product Marketing Manager",
        company: "Telerik",
        picture: "svetla.png"
    }];

var data = el.data('NextSpeakers');
for (var i = 0; i < speakersStatic.length; i++) {
    data.create(speakersStatic[i],
        function (data) {
            console.log("speaker added: " + JSON.stringify(data));
        },
        function (error) {
            console.log("error: " + error);
        });
}