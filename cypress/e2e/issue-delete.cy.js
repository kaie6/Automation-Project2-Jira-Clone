//Important elements
const BackLogList = '[data-testid="board-list:backlog"]';
const IssueDetailsModal = '[data-testid="modal:issue-details"]';
const singleIssue = '[data-testid="list-issue"]';
const issueTitle = 'textarea[placeholder="Short summary"]';
const deleteIcon = '[data-testid="icon:trash"]';
const conformationWindow = '[data-testid="modal:confirm"]';
const closeButtons = '[data-testid="icon:close"]';

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
    const initialIssueCount = Cypress.env("initialIssueCount");

    cy.get(singleIssue).first().invoke("text").as("firstIssueTitle");

    cy.get("@firstIssueTitle").then((firstIssueTitle) => {
      cy.get(singleIssue).first().click();

      cy.get(IssueDetailsModal).within(() => {
        cy.get(issueTitle).should("contain", firstIssueTitle);
        cy.log("First issue title is: " + firstIssueTitle);
        cy.get(deleteIcon).should("be.visible").click();
      });

      cy.get(conformationWindow)
        .should("be.visible")
        .and("contain", "Are you sure you want to delete this issue?")
        .and("contain", "Once you delete, it's gone for good.")
        .within(() => {
          cy.contains("button", "Delete issue").click();
        });

      cy.get(conformationWindow).should("not.exist");
      cy.get(IssueDetailsModal).should("not.exist");
      cy.url().should("eq", `${Cypress.env("baseUrl")}project/board`);
      cy.get(BackLogList)
        .should("be.visible")
        .and("have.length", "1")
        .children()
        .should("have.length", initialIssueCount - 1)
        .and("not.contain", firstIssueTitle);
    });
  });

  it("Should not delete the issue when user cancels its deletion", () => {
    const initialIssueCount = Cypress.env("initialIssueCount");

    cy.get(singleIssue).first().invoke("text").as("firstIssueTitle");

    cy.get("@firstIssueTitle").then((firstIssueTitle) => {
      cy.get(singleIssue).first().click();

      cy.get(IssueDetailsModal).within(() => {
        cy.get(issueTitle).should("contain", firstIssueTitle);
        cy.log("First issue title is: " + firstIssueTitle);
        cy.get(deleteIcon).should("be.visible").click();
      });

      cy.get(conformationWindow)
        .should("be.visible")
        .and("contain", "Are you sure you want to delete this issue?")
        .and("contain", "Once you delete, it's gone for good.")
        .within(() => {
          cy.contains("button", "Cancel").click();
        });

      cy.get(conformationWindow).should("not.exist");
      cy.get(IssueDetailsModal)
        .should("be.visible")
        .and("contain", firstIssueTitle);
      cy.get(closeButtons).first().click();

      cy.get(IssueDetailsModal).should("not.exist");
      cy.url().should("eq", `${Cypress.env("baseUrl")}project/board`);
      cy.get(BackLogList)
        .should("be.visible")
        .and("have.length", "1")
        .children()
        .should("have.length", initialIssueCount)
        .and("contain", firstIssueTitle);
    });
  });
});
