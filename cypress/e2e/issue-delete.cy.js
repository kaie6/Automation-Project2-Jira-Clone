//Important elements
const BackLogList = '[data-testid="board-list:backlog"]';
const IssueDetailsModal = '[data-testid="modal:issue-details"]';
const singleIssue = '[data-testid="list-issue"]';
const issueTitle = 'textarea[placeholder="Short summary"]';
const deleteIcon = '[data-testid="icon:trash"]';
const conformationWindow = '[data-testid="modal:confirm"]';
const closeButtons = '[data-testid="icon:close"]';
const message1 = "Are you sure you want to delete this issue?";
const message2 = "Once you delete, it's gone for good.";
let firstIssueTitle;

function ConfirmationWindowActions(buttonTitle) {
  cy.get(conformationWindow)
    .should("be.visible")
    .and("contain", message1)
    .and("contain", message2)
    .within(() => {
      cy.contains("button", buttonTitle).click();
    });
  cy.get(conformationWindow).should("not.exist");
}

function BacklogAssertions(deletedIssueCount, firstIssueTitle) {
  const initialIssueCount = Cypress.env("initialIssueCount");
  cy.url().should("eq", `${Cypress.env("baseUrl")}project/board`);
  cy.get(BackLogList)
    .should("be.visible")
    .and("have.length", "1")
    .children()
    .should("have.length", initialIssueCount - deletedIssueCount);
  if (deletedIssueCount < 1) {
    cy.get(BackLogList).should("contain", firstIssueTitle);
  } else {
    cy.get(BackLogList).should("not.contain", firstIssueTitle);
  }
}

describe("Issue Deletion", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.url()
      .should("eq", `${Cypress.env("baseUrl")}project`)
      .then((url) => {
        cy.visit(url + "/board");
        cy.get(BackLogList)
          .should("be.visible")
          .and("have.length", 1)
          .within(() => {
            cy.get(singleIssue).then((issues) => {
              const initialIssueCount = issues.length;
              Cypress.env("initialIssueCount", initialIssueCount);
            });
          });
      });
  });

  it("Should delete the first issue in the backlog column", () => {
    let deletedIssueCount = 1;

    //Get the name of the first issue for future assertions
    cy.get(singleIssue).first().invoke("text").as("firstIssueTitle");
    cy.get("@firstIssueTitle").then((text) => {
      //Save the name as a variable
      firstIssueTitle = text;
      cy.get(singleIssue).first().click();
      cy.get(IssueDetailsModal).within(() => {
        cy.get(issueTitle).should("contain", firstIssueTitle);
        cy.log("First issue title is: " + firstIssueTitle);
        cy.get(deleteIcon).should("be.visible").click();
      });

      ConfirmationWindowActions("Delete issue");

      cy.get(IssueDetailsModal).should("not.exist");

      BacklogAssertions(deletedIssueCount, firstIssueTitle);
    });
  });

  it("Should not delete the issue when user cancels its deletion", () => {
    let deletedIssueCount = 0;

    cy.get(singleIssue).first().invoke("text").as("firstIssueTitle");
    cy.get("@firstIssueTitle").then((text) => {
      firstIssueTitle = text;
      cy.get(singleIssue).first().click();
      cy.get(IssueDetailsModal).within(() => {
        cy.get(issueTitle).should("contain", firstIssueTitle);
        cy.log("First issue title is: " + firstIssueTitle);
        cy.get(deleteIcon).should("be.visible").click();
      });

      ConfirmationWindowActions("Cancel");

      cy.get(IssueDetailsModal)
        .should("be.visible")
        .and("contain", firstIssueTitle);
      cy.get(closeButtons).first().click();
      cy.get(IssueDetailsModal).should("not.exist");

      BacklogAssertions(deletedIssueCount, firstIssueTitle);
    });
  });
});
