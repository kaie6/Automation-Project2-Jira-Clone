import { faker } from "@faker-js/faker";
//Create issue data fields:
const description = ".ql-editor";
const title = 'input[name="title"]';
const issueType = '[data-testid="select:type"]';
const iconBug = '[data-testid="icon:bug"]';
const iconTask = '[data-testid="icon:task"]';
const SubmitButton = 'button[type="submit"]';
const CreateIssueWindow = '[data-testid="modal:issue-create"]';
const BackLogList = '[data-testid="board-list:backlog"]';

//random data
const RandomTitle = faker.lorem.word();
const RandomDescription = faker.lorem.words({ min: 3, max: 15 });

describe("Issue create", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.url().should("eq", `${Cypress.env("baseUrl")}project/board`);

    cy.get(BackLogList)
      .should("be.visible")
      .and("have.length", 1)
      .within(() => {
        cy.get('[data-testid="list-issue"]').then((issues) => {
          const initialIssueCount = issues.length;
          Cypress.env("initialIssueCount", initialIssueCount);
        });
      });
    cy.url().then((url) => {
      // System will already open issue creating modal in beforeEach block
      cy.visit(url + "/board?modal-issue-create=true");
    });
  });

  it("Should create an issue (story) and validate it successfully", () => {
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
      cy.get(issueType).click();
      cy.get('[data-testid="select-option:Story"]')
        .wait(1000)
        .trigger("mouseover")
        .trigger("click");
      cy.get('[data-testid="icon:story"]').should("be.visible");

      // Select Baby Yoda from reporter dropdown
      cy.get('[data-testid="select:reporterId"]').click();
      cy.get('[data-testid="select-option:Baby Yoda"]').click();

      // Select Baby Yoda from assignee dropdown
      cy.get('[data-testid="form-field:userIds"]').click();
      cy.get('[data-testid="select-option:Pickle Rick"]').click();

      // Click on button "Create issue"
      cy.get(SubmitButton).click();
    });

    // Assert that modal window is closed and successful message is visible
    cy.get(CreateIssueWindow).should("not.exist");
    cy.contains("Issue has been successfully created.").should("be.visible");

    // Reload the page to be able to see recently created issue
    // Assert that successful message has dissappeared after the reload
    cy.reload().wait(30000);
    cy.contains("Issue has been successfully created.").should("not.exist");

    // Assert than only one list with name Backlog is visible and do steps inside of it
    cy.get(BackLogList)
      .should("be.visible")
      .and("have.length", "1")
      .within(() => {
        // Assert that this list contains 5 issues and first element with tag p has specified text
        cy.get('[data-testid="list-issue"]')
          .should("have.length", initialIssueCount + 1)
          .first()
          .find("p")
          .contains("TEST_TITLE")
          .siblings()
          .within(() => {
            //Assert that correct avatar and type icon are visible
            cy.get('[data-testid="avatar:Pickle Rick"]').should("be.visible");
            cy.get('[data-testid="icon:story"]').should("be.visible");
          });
      });

    cy.get(BackLogList)
      .contains("TEST_TITLE")
      .within(() => {
        // Assert that correct avatar and type icon are visible
        cy.get('[data-testid="avatar:Pickle Rick"]').should("be.visible");
        cy.get('[data-testid="icon:story"]').should("be.visible");
      });
  });

  it("Should create an issue (bug) and validate it successfully", () => {
    const initialIssueCount = Cypress.env("initialIssueCount");

    // System finds modal for creating issue and does next steps inside of it
    cy.get(CreateIssueWindow).within(() => {
      // Type value to description input field
      cy.get(description).type("My bug description");
      cy.get(description).should("have.text", "My bug description");

      // Type value to title input field
      // Order of filling in the fields is first description, then title on purpose
      // Otherwise filling title first sometimes doesn't work due to web page implementation

      cy.get(title).type("Bug");
      cy.get(title).should("have.value", "Bug");

      // Open issue type dropdown and choose bug
      cy.get(issueType).click();
      cy.get('[data-testid="select-option:Bug"]')
        .wait(1000)
        .trigger("mouseover")
        .trigger("click");
      cy.get(iconBug).should("be.visible");

      // Select Pickle Rick from reporter dropdown
      cy.get('[data-testid="select:reporterId"]').click();
      cy.get('[data-testid="select-option:Pickle Rick"]').click();

      // Select Lord Gaben from assignee dropdown
      cy.get('[data-testid="form-field:userIds"]').click();
      cy.get('[data-testid="select-option:Lord Gaben"]').click();

      //Select priority from dropdown
      cy.get('[data-testid="select:priority"]').click();
      cy.get('[data-testid="select-option:High"]').click();

      // Click on button "Create issue"
      cy.get(SubmitButton).click();
    });

    // Assert that modal window is closed and successful message is visible

    cy.get(CreateIssueWindow).should("not.exist");
    cy.contains("Issue has been successfully created.").should("be.visible");

    // Reload the page to be able to see recently created issue
    // Assert that successful message has dissappeared after the reload
    cy.reload().wait(30000);
    cy.contains("Issue has been successfully created.").should("not.exist");

    // Assert than only one list with name Backlog is visible and do steps inside of it
    cy.get(BackLogList)
      .should("be.visible")
      .and("have.length", "1")
      .within(() => {
        // Assert that this list contains 5 issues and first element with tag p has specified text
        cy.get('[data-testid="list-issue"]')
          .should("have.length", initialIssueCount + 1)
          .first()
          .find("p")
          .contains("Bug")
          .siblings()
          .within(() => {
            //Assert that correct avatar and type icon are visible
            cy.get('[data-testid="avatar:Lord Gaben"]').should("be.visible");
            cy.get(iconBug).should("be.visible");
            cy.get('[data-testid="icon:arrow-up"]').should("be.visible");
          });
      });

    cy.get(BackLogList)
      .contains("Bug")
      .within(() => {
        // Assert that correct avatar and type icon are visible
        cy.get('[data-testid="avatar:Lord Gaben"]').should("be.visible");
        cy.get(iconBug).should("be.visible");
        cy.get('[data-testid="icon:arrow-up"]').should("be.visible");
      });
  });

  it("Should create an issue (task) with random data and validate it successfully", () => {
    const initialIssueCount = Cypress.env("initialIssueCount");

    // System finds modal for creating issue and does next steps inside of it
    cy.get(CreateIssueWindow).within(() => {
      // Type value to description input field
      cy.get(description).type(RandomDescription);
      cy.get(description).should("have.text", RandomDescription);

      // Type value to title input field
      // Order of filling in the fields is first description, then title on purpose
      // Otherwise filling title first sometimes doesn't work due to web page implementation

      cy.get(title).type(RandomTitle);
      cy.get(title).should("have.value", RandomTitle);

      // Select Pickle Rick from reporter dropdown
      cy.get('[data-testid="select:reporterId"]').click();
      cy.get('[data-testid="select-option:Baby Yoda"]').click();

      //Select priority from dropdown
      cy.get('[data-testid="select:priority"]').click();
      cy.get('[data-testid="select-option:Low"]').click();

      cy.get(issueType).then(($issueType) => {
        if ($issueType.text().includes("Task")) {
          cy.get(SubmitButton).click();
        } else {
          cy.get(issueType).click();
          cy.get('[data-testid="select-option:Task"]')
            .wait(1000)
            .trigger("mouseover")
            .trigger("click");
        }
      });
    });

    // Assert that modal window is closed and successful message is visible
    cy.get(CreateIssueWindow).should("not.exist");
    cy.contains("Issue has been successfully created.").should("be.visible");

    // Reload the page to be able to see recently created issue
    // Assert that successful message has dissappeared after the reload
    cy.reload().wait(30000);
    cy.contains("Issue has been successfully created.").should("not.exist");

    // Assert than only one list with name Backlog is visible and do steps inside of it
    cy.get(BackLogList)
      .should("be.visible")
      .and("have.length", "1")
      .within(() => {
        // Assert that this list contains 5 issues and first element with tag p has specified text
        cy.get('[data-testid="list-issue"]')
          .should("have.length", initialIssueCount + 1)
          .first()
          .find("p")
          .contains(RandomTitle)
          .siblings()
          .within(() => {
            //Assert that correct avatar and type icon are visible
            cy.get('[data-testid="icon:arrow-down"]').should("be.visible");
            cy.get(iconTask).should("be.visible");
          });
      });

    cy.get(BackLogList)
      .contains(RandomTitle)
      .within(() => {
        // Assert that correct priority and type icon are visible
        cy.get('[data-testid="icon:arrow-down"]').should("be.visible");
        cy.get(iconTask).should("be.visible");
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
