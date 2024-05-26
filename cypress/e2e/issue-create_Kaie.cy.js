import { faker } from "@faker-js/faker";

const CreateIssueWindow = '[data-testid="modal:issue-create"]';
//"Create issue" data fields and other selectors:
const description = ".ql-editor";
const title = 'input[name="title"]';
const issueTypeDropdown = '[data-testid="select:type"]';
const priorityDropdown = '[data-testid="select:priority"]';
const assigneeDropdown = '[data-testid="form-field:userIds"]';
const reporterDropdown = '[data-testid="select:reporterId"]';
const reporterSelectOptions = '[data-testid="select-option:';
const prioritySelectorBase = '[data-testid="select-option:text"]';
const assigneeSelectorBase = '[data-testid="select-option:text"]';
const issueTypeSelectorBase = '[data-testid="select-option:text"]';
const iconBug = '[data-testid="icon:bug"]';
const iconTask = '[data-testid="icon:task"]';
const iconStory = '[data-testid="icon:story"]';
const iconArrowDown = '[data-testid="icon:arrow-down"]';
const iconArrowUp = '[data-testid="icon:arrow-up"]';
const SubmitButton = 'button[type="submit"]';
const successMessage = "Issue has been successfully created.";
const BackLogList = '[data-testid="board-list:backlog"]';
const issueList = '[data-testid="list-issue"]';

//arrays of dropdown values
const priorityText = ["Lowest", "Low", "Medium", "High", "Highest"];
const users = ["Lord Gaben", "Pickle Rick", "Baby Yoda"];
const issueTypes = ["Task", "Bug", "Story"];

//random data
const RandomTitle = faker.lorem.word();
const RandomDescription = faker.lorem.words({ min: 3, max: 15 });

function reporterDropdownSelect(reporter) {
  cy.get(reporterDropdown).then(($reporterDropdown) => {
    const defaultOption = $reporterDropdown.text().trim(); // trim to ensure no whitespace issue
    cy.log(`DefaultOption text is ${defaultOption}`);
    if (defaultOption !== reporter) {
      cy.get(reporterDropdown).click();
      cy.get(reporterSelectOptions + reporter + '"]').click();
    }
    cy.get(reporterDropdown).should("contain", reporter);
  });
}

function priorityDropdownSelect(priorityText) {
  //create unique selector based on the actual value
  let prioritySelector = prioritySelectorBase.replace("text", priorityText);
  cy.log(`Priority should be ${priorityText}`);
  cy.get(priorityDropdown).then(($priorityDropdown) => {
    if ($priorityDropdown.text() === priorityText) {
    } else {
      cy.log(
        `Priority is ${priorityText} and priority selector is ${prioritySelector}`
      );
      cy.get(priorityDropdown).click();
      cy.get(prioritySelector).click();
    }
    cy.get(priorityDropdown).should("contain", priorityText);
  });
}

function assigneeDropdownSelect(assignee) {
  //create unique selector based on the actual value
  const assigneeSelector = assigneeSelectorBase.replace("text", assignee);
  cy.log(`Assignee should be ${assignee}`);
  cy.get(assigneeDropdown).then(($assigneeDropdown) => {
    if ($assigneeDropdown.text().trim() === assignee) {
      //do nothing if the assignee is already set correctly by default, continue to assertion
    } else {
      cy.log(
        `Assignee is ${assignee} and priority selector is ${assigneeSelector}` //to check if variables are correct
      );
      cy.get(assigneeDropdown).click();
      cy.get(assigneeSelector).click();
    }
    cy.get(assigneeDropdown).should("contain", assignee);
  });
}

function issueTypeDropdownSelect(issueType) {
  //creating a unique selector using the value from function callback
  const issueTypeSelector = issueTypeSelectorBase.replace("text", issueType);
  cy.get(issueTypeDropdown).then(($issueTypeDefault) => {
    if ($issueTypeDefault.text().trim() === issueType) {
    } else {
      cy.get(issueTypeDropdown).click();
      cy.get(issueTypeSelector)
        .wait(1000)
        .trigger("mouseover")
        .trigger("click");
    }
    cy.get(issueTypeDropdown).should("contain", issueType);
  });
}

describe("Issue create", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.url().should("eq", `${Cypress.env("baseUrl")}project/board`);

    cy.get(BackLogList)
      .should("be.visible")
      .and("have.length", 1)
      .within(() => {
        cy.get(issueList).then((issues) => {
          //save the initial issue count for furture assertions
          const initialIssueCount = issues.length;
          //sets an environment variable so it can be accessed later in the test suite
          Cypress.env("initialIssueCount", initialIssueCount);
        });
      });
    cy.url().then((url) => {
      // System will already open issue creating modal in beforeEach block
      cy.visit(url + "/board?modal-issue-create=true");
    });
  });

  it("Should create an issue (story) and validate it successfully", () => {
    //accessing the Environment Variable saved in the beforeEach section
    const initialIssueCount = Cypress.env("initialIssueCount");

    // System finds modal for creating issue and does next steps inside of it
    cy.get(CreateIssueWindow).within(() => {
      // Type value to description input field
      cy.get(description).type("TEST_DESCRIPTION");
      cy.get(description).should("have.text", "TEST_DESCRIPTION");

      // Type value to title input field
      // Order of filling in the fields is first description, then title on purpose
      // Otherwise filling title first sometimes doesn't work due to web page implementation
      cy.get(title).type("TEST_TITLE");
      cy.get(title).should("have.value", "TEST_TITLE");

      // Open issue type dropdown and choose Story
      issueTypeDropdownSelect(issueTypes[2]);
      cy.get(iconStory).should("be.visible");

      // Select Baby Yoda from reporter dropdown
      reporterDropdownSelect(users[2]);

      // Select Pickle Rick from assignee dropdown
      assigneeDropdownSelect(users[1]);

      //Assert that issue priority is "Medium" by default
      priorityDropdownSelect(priorityText[2]);

      // Click on button "Create issue"
      cy.get(SubmitButton).click();
    });

    // Assert that modal window is closed and successful message is visible
    cy.get(CreateIssueWindow).should("not.exist");
    cy.contains(successMessage).should("be.visible");

    // Reload the page to be able to see recently created issue. Assert that successful message has dissappeared after the reload
    cy.reload().wait(30000);
    cy.contains(successMessage).should("not.exist");

    // Assert than only one list with name Backlog is visible and do steps inside of it
    cy.get(BackLogList)
      .should("be.visible")
      .and("have.length", "1")
      .within(() => {
        // Assert that this list has increased by one and first element with tag p has specified text
        cy.get(issueList)
          .should("have.length", initialIssueCount + 1)
          .first()
          .find("p")
          .contains("TEST_TITLE")
          .siblings()
          .within(() => {
            //Assert that correct avatar and type icon are visible
            cy.get(`[data-testid="avatar:${users[1]}"]`).should("be.visible");
            cy.get(iconStory).should("be.visible");
            cy.get(iconArrowUp).should("be.visible");
          });
      });

    cy.get(BackLogList)
      .contains("TEST_TITLE")
      .within(() => {
        // Assert that correct avatar and type icon are visible
        cy.get(`[data-testid="avatar:${users[1]}"]`).should("be.visible");
        cy.get(iconStory).should("be.visible");
        cy.get(iconArrowUp).should("be.visible");
      });
  });

  it("Should create an issue (bug) and validate it successfully", () => {
    const initialIssueCount = Cypress.env("initialIssueCount");

    cy.get(CreateIssueWindow).within(() => {
      cy.get(description).type("My bug description");
      cy.get(description).should("have.text", "My bug description");

      cy.get(title).type("Bug");
      cy.get(title).should("have.value", "Bug");

      issueTypeDropdownSelect(issueTypes[1]); //type should be bug
      cy.get(iconBug).should("be.visible");
      reporterDropdownSelect(users[1]); //reporter is Pickle Rick
      assigneeDropdownSelect(users[0]); // Lord Gaben is assignee
      priorityDropdownSelect(priorityText[4]); //priority is highest

      cy.get(SubmitButton).click();
    });

    cy.get(CreateIssueWindow).should("not.exist");
    cy.contains(successMessage).should("be.visible");
    cy.reload().wait(30000);
    cy.contains(successMessage).should("not.exist");

    cy.get(BackLogList)
      .should("be.visible")
      .and("have.length", "1")
      .within(() => {
        cy.get(issueList)
          .should("have.length", initialIssueCount + 1)
          .first()
          .find("p")
          .contains("Bug")
          .siblings()
          .within(() => {
            cy.get(`[data-testid="avatar:${users[0]}"]`).should("be.visible");
            cy.get(iconBug).should("be.visible");
            cy.get(iconArrowUp).should("be.visible");
          });
      });
  });

  it("Should create an issue (task) with random data and validate it successfully", () => {
    const initialIssueCount = Cypress.env("initialIssueCount");

    cy.get(CreateIssueWindow).within(() => {
      cy.get(description).type(RandomDescription);
      cy.get(description).should("have.text", RandomDescription);
      cy.get(title).type(RandomTitle);
      cy.get(title).should("have.value", RandomTitle);

      reporterDropdownSelect(users[2]); //reporter Baby Yoda
      priorityDropdownSelect(priorityText[1]); //priority low
      issueTypeDropdownSelect(issueTypes[0]); // issue type: task

      cy.get(SubmitButton).click();
    });

    cy.get(CreateIssueWindow).should("not.exist");
    cy.contains(successMessage).should("be.visible");

    cy.reload().wait(30000);
    cy.contains(successMessage).should("not.exist");

    cy.get(BackLogList)
      .should("be.visible")
      .and("have.length", "1")
      .within(() => {
        cy.get(issueList)
          .should("have.length", initialIssueCount + 1)
          .first()
          .find("p")
          .contains(RandomTitle)
          .siblings()
          .within(() => {
            cy.get(iconArrowDown).should("be.visible");
            cy.get(iconTask).should("be.visible");
          });
      });
  });

  it("Should validate title is required field if missing", () => {
    // System finds modal for creating issue and does next steps inside of it
    cy.get(CreateIssueWindow).within(() => {
      // Try to click create issue button without filling any data
      cy.get(SubmitButton).scrollIntoView();
      cy.get(SubmitButton)
        .should("be.visible")
        .and("be.enabled")
        .wait(10000)
        .click();

      // Assert that correct error message is visible
      cy.get('[data-testid="form-field:title"]')
        .should("be.visible")
        .and("contain", "This field is required");
    });
  });
});
