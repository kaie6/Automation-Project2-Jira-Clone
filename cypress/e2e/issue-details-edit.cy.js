describe("Issue details editing", () => {
  const getIssueDetailsModal = () =>
    cy.get('[data-testid="modal:issue-details"]');
  const priorityDropdown = '[data-testid="select:priority"]';
  const reporterDropdown = '[data-testid="select:reporter"]';
  const onlyCharactersRegex = /^[A-Za-z\s]+$/;

  beforeEach(() => {
    cy.visit("/");
    cy.url()
      .should("eq", `${Cypress.env("baseUrl")}project`)
      .then((url) => {
        cy.visit(url + "/board");
        cy.contains("This is an issue of type: Task.").click();
      });
  });

  it("Should update type, status, assignees, reporter, priority successfully", () => {
    getIssueDetailsModal().within(() => {
      cy.get('[data-testid="select:type"]').click("bottomRight");
      cy.get('[data-testid="select-option:Story"]')
        .trigger("mouseover")
        .trigger("click");
      cy.get('[data-testid="select:type"]').should("contain", "Story");

      cy.get('[data-testid="select:status"]').click("bottomRight");
      cy.get('[data-testid="select-option:Done"]').click();
      cy.get('[data-testid="select:status"]').should("have.text", "Done");

      cy.get('[data-testid="select:assignees"]').click("bottomRight");
      cy.get('[data-testid="select-option:Lord Gaben"]').click();
      cy.get('[data-testid="select:assignees"]').click("bottomRight");
      cy.get('[data-testid="select-option:Baby Yoda"]').click();
      cy.get('[data-testid="select:assignees"]').should("contain", "Baby Yoda");
      cy.get('[data-testid="select:assignees"]').should(
        "contain",
        "Lord Gaben"
      );

      cy.get(reporterDropdown).click("bottomRight");
      cy.get('[data-testid="select-option:Pickle Rick"]').click();
      cy.get(reporterDropdown).should("have.text", "Pickle Rick");

      cy.get(priorityDropdown).click("bottomRight");
      cy.get('[data-testid="select-option:Medium"]').click();
      cy.get(priorityDropdown).should("have.text", "Medium");
    });
  });

  it("Should update title, description successfully", () => {
    const title = "TEST_TITLE";
    const description = "TEST_DESCRIPTION";

    getIssueDetailsModal().within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type(title)
        .blur();

      cy.get(".ql-snow").click().should("not.exist");

      cy.get(".ql-editor").clear().type(description);

      cy.contains("button", "Save").click().should("not.exist");

      cy.get('textarea[placeholder="Short summary"]').should(
        "have.text",
        title
      );
      cy.get(".ql-snow").should("have.text", description);
    });
  });

  it.only('Should check the "Priority" dropdown values', () => {
    const expectedLength = 5;
    const priorityOptions = [];

    getIssueDetailsModal().within(() => {
      cy.get(priorityDropdown)
        .invoke("text")
        .then((text) => {
          //push the selected priority value to the empty array
          priorityOptions.unshift(text);
          cy.log(priorityOptions[0], priorityOptions.length);
        });

      cy.get(priorityDropdown).click("bottomRight");
      //Choosing the selector to access all options from the dropdown and looping through the elements
      cy.get('[data-testid*="select-option:"]')
        .each(($option) => {
          const priorityText = $option.text().trim();
          //saving the text value of the element to the existing array
          priorityOptions.push(priorityText);
          cy.log(
            `Added priority: ${priorityText}. Current array length: ${priorityOptions.length}`
          );
        })
        .then(() => {
          //Asserting that the created array has the expected length
          expect(priorityOptions.length).to.equal(expectedLength);
          cy.log(
            "These are Priority dropdown menu options: " + priorityOptions
          );
          cy.log(
            "This is the amount of options in the Priorities dropdown menu: " +
              priorityOptions.length
          );
        });
    });
  });

  it.only("Should check that the reporter name only has characters in it", () => {
    cy.get(reporterDropdown).then(($option) => {
      const reporterName = $option.text().trim();
      cy.log(reporterName);
      // Assert that the name matches the regular expression pattern
      const isOnlyCharacters = onlyCharactersRegex.test(reporterName);
      cy.log(
        `Reporter name '${reporterName}' contains only characters: ${isOnlyCharacters}`
      );
      // Assert that the name contains only characters
      expect(isOnlyCharacters).to.be.true;
    });
  });
});
