import IssueModal from "../../pages/IssueModal";

describe("Issue time tracking", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.url()
      .should("eq", `${Cypress.env("baseUrl")}project`)
      .then((url) => {
        cy.visit(url + "/board");
        IssueModal.openFirstIssue();
      });
  });

  it("Should add, update and remove time estimation using the Original estimate (hours) field", () => {
    const estimatedHours = 10;
    const editedEstimatedHours = 20;

    IssueModal.clearTimeTrackingSection();
    IssueModal.fillOriginalEstimateField(estimatedHours);
    IssueModal.verifySavedEstimation(estimatedHours);
    IssueModal.fillOriginalEstimateField(editedEstimatedHours);
    IssueModal.verifySavedEstimation(editedEstimatedHours);
    IssueModal.emptyOriginalEstimateField();
    IssueModal.verifySavedEstimation("");
  });

  it("Should add and remove logged time using the time tracking section", () => {
    const timeSpent = 2;
    const timeRemaining = 5;
    const estimatedHours = 7;

    IssueModal.fillOriginalEstimateField(estimatedHours);
    IssueModal.verifySavedEstimation(estimatedHours);
    IssueModal.fillTimeTrackingSection(timeSpent, timeRemaining);
    IssueModal.assertTimeTrackingSectionTimeSpent(timeSpent);
    IssueModal.assertTimeTrackingSectionTimeRemaining(
      timeRemaining,
      estimatedHours
    );
    IssueModal.clearTimeTrackingSection();
    IssueModal.assertTimeTrackingSectionTimeSpent("");
    IssueModal.assertTimeTrackingSectionTimeRemaining("", estimatedHours);
  });
});
