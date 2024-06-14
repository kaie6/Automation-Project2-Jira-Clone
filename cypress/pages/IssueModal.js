class IssueModal {
  constructor() {
    this.submitButton = 'button[type="submit"]';
    this.issueModal = '[data-testid="modal:issue-create"]';
    this.issueDetailModal = '[data-testid="modal:issue-details"]';
    this.title = 'input[name="title"]';
    this.issueType = '[data-testid="select:type"]';
    this.descriptionField = ".ql-editor";
    this.assignee = '[data-testid="select:userIds"]';
    this.backlogList = '[data-testid="board-list:backlog"]';
    this.issuesList = '[data-testid="list-issue"]';
    this.deleteButton = '[data-testid="icon:trash"]';
    this.deleteButtonName = "Delete issue";
    this.cancelDeletionButtonName = "Cancel";
    this.confirmationPopup = '[data-testid="modal:confirm"]';
    this.closeDetailModalButton = '[data-testid="icon:close"]';
    this.timeTrackingModal = '[data-testid="modal:tracking"]';
    this.originalEstimateField = '[placeholder="Number"]';
    this.doneButtonName = "Done";
    this.getTimeTrackingSection = () =>
      cy.get('[data-testId="icon:stopwatch"]').next();
    this.getTimeSpent = () =>
      cy.contains("Time spent").next().children().click();
    this.getTimeRemaining = () =>
      cy.contains("Time remaining (hours)").next().children().click();
  }

  //Core Actions

  openFirstIssue() {
    cy.get(this.backlogList, { timeout: 60000 })
      .should("be.visible")
      .find(this.issuesList)
      .first()
      .click();
  }

  closeDetailModal() {
    cy.get(this.closeDetailModalButton).first().click();
    this.getIssueDetailModal().should("not.exist");
  }

  fillOriginalEstimateField(hours) {
    this.getIssueDetailModal()
      .should("be.visible")
      .within(() => {
        this.getOriginalEstimateField()
          .click("topRight")
          .clear()
          .type(hours)
          .blur();
        this.getOriginalEstimateField().should("have.value", hours);
        this.getTimeTrackingSection().should("contain", hours + "h estimated");
        this.closeDetailModal();
      });
  }

  emptyOriginalEstimateField() {
    this.getIssueDetailModal()
      .should("be.visible")
      .within(() => {
        this.getOriginalEstimateField().click("topRight").clear().blur();
        this.getOriginalEstimateField().should("have.value", "");
        this.getTimeTrackingSection().should("not.contain", "h estimated");
        this.closeDetailModal();
      });
  }

  fillTimeTrackingSection(timeSpent, timeRemaining) {
    this.getIssueDetailModal().should("be.visible");
    this.getTimeTrackingSection().click();
    this.getTimeTrackingModal()
      .should("be.visible")
      .within(() => {
        this.getTimeSpent()
          .clear()
          .type(timeSpent)
          .should("have.value", timeSpent);
        this.getTimeRemaining()
          .clear()
          .type(timeRemaining)
          .should("have.value", timeRemaining);
        this.clickDoneButton();
      });
    this.getTimeTrackingModal().should("not.exist");
    this.getIssueDetailModal().should("be.visible");
  }

  clearTimeTrackingSection() {
    this.getIssueDetailModal().should("be.visible");
    this.getTimeTrackingSection()
      .should("be.visible")
      .then(($element) => {
        if ($element.text === "No time logged") {
          cy.log("No time logged");
          this.getTimeTrackingSection().should("contain", "No time logged");
        } else {
          this.getTimeTrackingSection().click();
          this.getTimeTrackingModal()
            .should("be.visible")
            .within(() => {
              this.getTimeSpent()
                .clear()
                .should("have.value", "")
                .and("have.attr", "placeholder", "Number");
              this.getTimeRemaining()
                .clear()
                .should("have.value", "")
                .and("have.attr", "placeholder", "Number");
              this.clickDoneButton();
            });
          this.getTimeTrackingModal().should("not.exist");
        }
      });
  }

  createIssue(issueDetails) {
    this.getIssueModal().within(() => {
      this.selectIssueType(issueDetails.type);
      this.editDescription(issueDetails.description);
      this.editTitle(issueDetails.title);
      this.selectAssignee(issueDetails.assignee);
      cy.get(this.submitButton).click();
    });
  }

  //Clicking buttons

  clickDoneButton() {
    cy.contains(this.doneButtonName).click().should("not.exist");
  }

  clickDeleteButton() {
    cy.get(this.deleteButton).click();
    cy.get(this.confirmationPopup).should("be.visible");
  }

  confirmDeletion() {
    cy.get(this.confirmationPopup).within(() => {
      cy.contains(this.deleteButtonName).click();
    });
    cy.get(this.confirmationPopup).should("not.exist");
    cy.get(this.backlogList).should("be.visible");
  }

  cancelDeletion() {
    cy.get(this.confirmationPopup).within(() => {
      cy.contains(this.cancelDeletionButtonName).click();
    });
    cy.get(this.confirmationPopup).should("not.exist");
    this.getIssueDetailModal().should("be.visible");
  }

  //Utility methods

  getOriginalEstimateField() {
    return cy.get(this.originalEstimateField);
  }

  getTimeTrackingModal() {
    return cy.get(this.timeTrackingModal);
  }

  getIssueModal() {
    return cy.get(this.issueModal);
  }

  getIssueDetailModal() {
    return cy.get(this.issueDetailModal);
  }

  selectIssueType(issueType) {
    cy.get(this.issueType).click("bottomRight");
    cy.get(`[data-testid="select-option:${issueType}"]`)
      .trigger("mouseover")
      .trigger("click");
  }

  selectAssignee(assigneeName) {
    cy.get(this.assignee).click("bottomRight");
    cy.get(`[data-testid="select-option:${assigneeName}"]`).click();
  }

  editTitle(title) {
    cy.get(this.title).debounced("type", title);
  }

  editDescription(description) {
    cy.get(this.descriptionField).type(description);
  }

  //Assertions

  verifySavedEstimation(estimatedHours) {
    //add "" when field is empty
    this.openFirstIssue();
    this.getOriginalEstimateField().should("be.visible").wait(5000);
    if (estimatedHours === "") {
      // If the field is empty, check for the placeholder
      this.getOriginalEstimateField().should("have.value", "");
      this.getOriginalEstimateField().should(
        "have.attr",
        "placeholder",
        "Number"
      );
      this.getTimeTrackingSection().should("not.contain", "h estimated");
    } else {
      this.getOriginalEstimateField().should("have.value", estimatedHours);
      this.getTimeTrackingSection().should(
        "contain",
        `${estimatedHours}h estimated`
      );
    }
  }

  assertTimeTrackingSectionTimeSpent(timeSpent) {
    this.getTimeTrackingSection().should("be.visible");
    if (timeSpent > 0)
      this.getTimeTrackingSection()
        .should("contain", `${timeSpent}h logged`)
        .and("not.contain", "No time logged");
    else
      this.getTimeTrackingSection()
        .should("not.contain", `${timeSpent}h logged`)
        .and("contain", "No time logged");
  }

  assertTimeTrackingSectionTimeRemaining(timeRemaining, estimatedHours) {
    this.getTimeTrackingSection().should("be.visible");
    if (timeRemaining > 0)
      this.getTimeTrackingSection()
        .should("contain", `${timeRemaining}h remaining`)
        .and("not.contain", `${estimatedHours}h estimated`);
    else
      this.getTimeTrackingSection()
        .should("not.contain", `${timeRemaining}h remaining`)
        .and("contain", `${estimatedHours}h estimated`);
  }

  ensureIssueIsCreated(expectedAmountIssues, issueDetails) {
    cy.get(this.issueModal).should("not.exist");
    cy.reload();
    cy.contains("Issue has been successfully created.").should("not.exist");

    cy.get(this.backlogList)
      .should("be.visible")
      .and("have.length", "1")
      .within(() => {
        cy.get(this.issuesList)
          .should("have.length", expectedAmountIssues)
          .first()
          .find("p")
          .contains(issueDetails.title);
        cy.get(`[data-testid="avatar:${issueDetails.assignee}"]`).should(
          "be.visible"
        );
      });
  }

  ensureIssueIsVisibleOnBoard(issueTitle) {
    cy.get(this.issueDetailModal).should("not.exist");
    cy.reload();
    cy.contains(issueTitle).should("be.visible");
  }

  ensureIssueIsNotVisibleOnBoard(issueTitle) {
    cy.get(this.issueDetailModal).should("not.exist");
    cy.reload();
    cy.log(this.issueDetailModal);
  }

  validateIssueVisibilityState(issueTitle, isVisible = true) {
    cy.get(this.issueDetailModal).should("not.exist");
    cy.reload();
    cy.get(this.backlogList).should("be.visible");
    if (isVisible) cy.contains(issueTitle).should("be.visible");
    if (!isVisible) cy.contains(issueTitle).should("not.exist");
  }
}

export default new IssueModal();
