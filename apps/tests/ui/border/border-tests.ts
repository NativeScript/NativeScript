import buttonModule = require("ui/button");
import colorModule = require("color");

// <snippet module="ui/border" title="Border">
// # Border
// Using borders requires the "ui/border" module.
// ``` JavaScript
import borderModule = require("ui/border");
// ```

// ### Declaring a Border.
//```XML
//  <Page>
//      <Border cornerRadius="10" borderWidth="1" borderColor="#FF0000">
//          <Button text="OK"/>
//      </Border>
//  </Page>
//```
// </snippet>

export function test_DummyTestForCodeSnippet() {
    // <snippet module="ui/border" title="Border">
    // ### Creating a Border programmatically
    // ``` JavaScript
    var button = new buttonModule.Button();
    button.text = "OK";

    var border = new borderModule.Border();
    border.cornerRadius = 10;
    border.borderWidth = 1;
    border.borderColor = new colorModule.Color("#FF0000");

    border.content = button;
    // ```
    // </snippet>
}