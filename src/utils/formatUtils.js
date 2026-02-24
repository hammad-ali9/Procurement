export const toWords = (amount) => {
    if (amount === 0) return 'Zero';

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (num) => {
        let str = '';
        if (num >= 100) {
            str += units[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num >= 20) {
            str += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        }
        if (num > 0) {
            str += units[num] + ' ';
        }
        return str.trim();
    };

    const parts = amount.toString().split('.');
    let num = parseInt(parts[0]);
    const decimalPart = parts[1] ? parseInt(parts[1].substring(0, 2)) : 0;

    let result = '';

    // Crore (1,00,00,000)
    if (num >= 10000000) {
        result += convertLessThanThousand(Math.floor(num / 10000000)) + ' Crore ';
        num %= 10000000;
    }

    // Lac (1,00,000)
    if (num >= 100000) {
        result += convertLessThanThousand(Math.floor(num / 100000)) + ' Lac ';
        num %= 100000;
    }

    // Thousand (1,000)
    if (num >= 1000) {
        result += convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand ';
        num %= 1000;
    }

    // Hundreds
    if (num > 0) {
        result += convertLessThanThousand(num);
    }

    result = result.trim() + ' Only';

    if (decimalPart > 0) {
        result = result.replace(' Only', ` and ${decimalPart}/100 Only`);
    }

    return result.trim();
};
