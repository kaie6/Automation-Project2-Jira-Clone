describe("Issue time tracking", () => {
  const backLogList = '[data-testid="board-list:backlog"]';
  const issueList = '[data-testid="list-issue"]';
  const getTimeTrackingSection = () =>
    cy.get('[data-testId="icon:stopwatch"]').next();
  const getTimeSpent = () =>
    cy.contains("Time spent").next().children().click();
  const getTimeRemaining = () =>
    cy.contains("Time remaining (hours)").next().children().click();
  const getOriginalEstimateField = () => cy.get('[placeholder="Number"]');
  const getTimeTrackingModal = () => cy.get('[data-testid="modal:tracking"]');
  const getIssueDetailsModal = () =>
    cy.get('[data-testid="modal:issue-details"]');
  const clickDoneButton = () => cy.contains("Done").click().should("not.exist");
  const clickCloseIssueDetaisModal = () =>
    cy.get('[data-testid="icon:close"]').first().click();

  function openFirstIssue() {
    cy.get(backLogList, { timeout: 60000 })
      .should("be.visible")
      .find(issueList)
      .first()
      .click();
  }

  function fillOriginalEstimateField(hours) {
    getIssueDetailsModal()
      .should("be.visible")
      .within(() => {
        getOriginalEstimateField().click("topRight").clear().type(hours).blur();
        getOriginalEstimateField().should("have.value", hours);
        getTimeTrackingSection().should("contain", hours + "h estimated");
        clickCloseIssueDetaisModal();
      });
    getIssueDetailsModal().should("not.exist");
  }

  function emptyOriginalEstimateField() {
    getIssueDetailsModal()
      .should("be.visible")
      .within(() => {
        getOriginalEstimateField().click("topRight").clear().blur();
        getOriginalEstimateField().should("have.value", "");
        getTimeTrackingSection().should("not.contain", "h estimated");
        clickCloseIssueDetaisModal();
      });
    getIssueDetailsModal().should("not.exist");
  }

  function verifySavedEstimation(estimatedHours) {
    //add "" when field is empty
    openFirstIssue();
    getOriginalEstimateField().should("be.visible").wait(5000);
    if (estimatedHours === "") {
      // If the field is empty, check for the placeholder
      getOriginalEstimateField().should("have.value", "");
      getOriginalEstimateField().should("have.attr", "placeholder", "Number");
      getTimeTrackingSection().should("not.contain", "h estimated");
    } else {
      getOriginalEstimateField().should("have.value", estimatedHours);
      getTimeTrackingSection().should(
        "contain",
        `${estimatedHours}h estimated`
      );
    }
  }

  function clearTimeTrackingSection() {
    getIssueDetailsModal().should("be.visible");
    getTimeTrackingSection()
      .should("be.visible")
      .then(($element) => {
        if ($element.text === "No time logged") {
          cy.log("No time logged");
          getTimeTrackingSection().should("contain", "No time logged");
        } else {
          getTimeTrackingSection().click();
          getTimeTrackingModal()
            .should("be.visible")
            .within(() => {
              getTimeSpent()
                .clear()
                .should("have.value", "")
                .and("have.attr", "placeholder", "Number");
              getTimeRemaining()
                .clear()
                .should("have.value", "")
                .and("have.attr", "placeholder", "Number");
              clickDoneButton();
            });
          getTimeTrackingModal().should("not.exist");
        }
      });
  }

  function fillTimeTrackingSection(timeSpent, timeRemaining) {
    getIssueDetailsModal().should("be.visible");
    getTimeTrackingSection().click();
    getTimeTrackingModal()
      .should("be.visible")
      .within(() => {
        getTimeSpent().clear().type(timeSpent).should("have.value", timeSpent);
        getTimeRemaining()
          .clear()
          .type(timeRemaining)
          .should("have.value", timeRemaining);
        clickDoneButton();
      });
    getTimeTrackingModal().should("not.exist");
    getIssueDetailsModal().should("be.visible");
  }

  function assertTimeTrackingSectionTimeSpent(timeSpent) {
    getTimeTrackingSection().should("be.visible");
    if (timeSpent > 0)
      getTimeTrackingSection()
        .should("contain", `${timeSpent}h logged`)
        .and("not.contain", "No time logged");
    else
      getTimeTrackingSection()
        .should("not.contain", `${timeSpent}h logged`)
        .and("contain", "No time logged");
  }

  function assertTimeTrackingSectionTimeRemaining(
    timeRemaining,
    estimatedHours
  ) {
    getTimeTrackingSection().should("be.visible");
    if (timeRemaining > 0)
      getTimeTrackingSection()
        .should("contain", `${timeRemaining}h remaining`)
        .and("not.contain", `${estimatedHours}h estimated`);
    else
      getTimeTrackingSection()
        .should("not.contain", `${timeRemaining}h remaining`)
        .and("contain", `${estimatedHours}h estimated`);
  }

  beforeEach(() => {
    cy.visit("/");
    cy.url()
      .should("eq", `${Cypress.env("baseUrl")}project`)
      .then((url) => {
        cy.visit(url + "/board");
        openFirstIssue();
      });
  });

  it("Should add, update and remove time estimation using the Original estimate (hours) field", () => {
    const estimatedHours = 10;
    const editedEstimatedHours = 20;

    clearTimeTrackingSection();
    fillOriginalEstimateField(estimatedHours);
    verifySavedEstimation(estimatedHours);
    fillOriginalEstimateField(editedEstimatedHours);
    verifySavedEstimation(editedEstimatedHours);
    emptyOriginalEstimateField();
    verifySavedEstimation("");
  });

  it("Should add and remove logged time using the time tracking section", () => {
    const timeSpent = 2;
    const timeRemaining = 5;
    const estimatedHours = 7;

    fillOriginalEstimateField(estimatedHours);
    verifySavedEstimation(estimatedHours);
    fillTimeTrackingSection(timeSpent, timeRemaining);
    assertTimeTrackingSectionTimeSpent(timeSpent);
    assertTimeTrackingSectionTimeRemaining(timeRemaining, estimatedHours);
    clearTimeTrackingSection();
    assertTimeTrackingSectionTimeSpent("");
    assertTimeTrackingSectionTimeRemaining("", estimatedHours);
  });
});
