// default some values for testing
$( document ).ready(function() {
    $("#loanAmount").val(400000);
    $("#interestRate").val(5);
    $("#loanTerm").val(15);
    calculateMortgage();
});

function calculateMortgagePayment(loanAmount, interestRate, numberOfPayments, paymentNumber = 0) {
    // Convert annual interest rate to monthly
    const monthlyInterestRate = interestRate / 100 / 12;

    loanAmount = parseFloat(loanAmount);
    interestRate = parseFloat(interestRate);
    numberOfPayments = parseInt(numberOfPayments);
    paymentNumber = parseInt(paymentNumber);

    if (paymentNumber > 0)
        numberOfPayments -= (paymentNumber - 1);

    // Calculate the monthly payment using the formula
    let monthlyPayment = loanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    let interestOnly = loanAmount * (monthlyInterestRate);
    let balanceAfterPayment = loanAmount - (monthlyPayment - interestOnly)

    return Payment = {
        totalPayment: monthlyPayment,
        principalPayment: monthlyPayment - interestOnly,
        interestPayment: interestOnly,
        paymentNumber: paymentNumber,
        resultingBalance: balanceAfterPayment};
  }

function calculateMortgage() {

    $('#paymentScheduleTable tbody').empty();

    // add validation to ensure all values are present and numeric/valid
    let loanAmount = $("#loanAmount").val();
    let interestRate = $("#interestRate").val();
    let loanTermYears = $("#loanTerm").val();

    let originalPaymentSchedule = recalculatePaymentSchedule(true);
    $("#minMonthlyPayment").val(originalPaymentSchedule[0].totalPayment.toFixed(2));
    let totalInterestPaid = originalPaymentSchedule.reduce((accumulator, currentValue) => accumulator + currentValue.interestPayment, 0);
    $("#totalInterestPaid").val(totalInterestPaid.toFixed(2));


    let updatedPaymentSchedule = recalculatePaymentSchedule(false);

    updatedPaymentSchedule.forEach(payment => {

        const totalPrincipal = updatedPaymentSchedule.reduce((accumulator, currentPayment) => {
            if (currentPayment.paymentNumber <= payment.paymentNumber) {
              return accumulator + currentPayment.principalPayment;
            } else {
              return accumulator;
            }
          }, 0);

        const totalInterest = updatedPaymentSchedule.reduce((accumulator, currentPayment) => {
            if (currentPayment.paymentNumber <= payment.paymentNumber) {
              return accumulator + currentPayment.interestPayment;
            } else {
              return accumulator;
            }
          }, 0);

        $('#paymentScheduleTable > tbody:last-child').append(`
            <tr>
                <th scope="row">${payment.paymentNumber}</th>
                <td>${Math.ceil((payment.paymentNumber) / 12)}</td>
                <td>${payment.resultingBalance.toFixed(2)}</td>
                <td>${payment.principalPayment.toFixed(2)}</td>
                <td>${payment.interestPayment.toFixed(2)}</td>
                <td>${payment.totalPayment.toFixed(2)}</td>
                <td>${totalPrincipal.toFixed(2)}</td>
                <td>${totalInterest.toFixed(2)}</td>
                <td><div class="input-group input-group-sm">
                    <div class="input-group-prepend">
                        <span class="input-group-text">$</span>
                    </div>
                    <input type="number" class="form-control" placeholder="" id="pmt${payment.paymentNumber}ExtraPayment" />
                </div></td>
                <td><div class="input-group input-group-sm">
                    <div class="input-group-prepend">
                        <span class="input-group-text">$</span>
                    </div>
                    <input type="number" class="form-control" placeholder="" id="pmt${payment.paymentNumber}ChangePayment" />
                </div></td>
            </tr>
        `);
    });
}

function recalculatePaymentSchedule(originalMortgage = false) {
    let loanAmount = $("#loanAmount").val();
    let interestRate = $("#interestRate").val();
    let loanTermYears = $("#loanTerm").val();
    let numberOfPayments = loanTermYears * 12;

    let payments = [];

    for (let paymentNumber = 1; paymentNumber <= numberOfPayments; paymentNumber++) {   

        let payment = calculateMortgagePayment(loanAmount, interestRate, numberOfPayments, paymentNumber);
        payments.push(payment);

        // reduce the loan amount for the next payment
        loanAmount = loanAmount - (payment.totalPayment - payment.interestPayment);

        
    }
    return payments;
}