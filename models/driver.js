const { makeSingleQuery } = require('../db');
const { User } = require('./user');

class Driver {
  constructor(email) {
    this.email = email;
  }

  async save() {
    await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Drivers (email)
        VALUES ($1)
      `,
      values: [this.email],
    });
    return this;
  }

  async delete() {
    await makeSingleQuery({
      text: /* sql */ `
        DELETE FROM Drivers
        WHERE email = $1
      `,
      values: [this.email],
    });
    return this;
  }

  static async findByEmailWithUser(email) {
    const drivers = await makeSingleQuery({
      text: /* sql */ `
        SELECT D.email, U.secret, U.name, U.gender, U.phone, U.profile_photo_url, U.created_on, U.updated_on
        FROM Drivers D NATURAL JOIN Users U
        WHERE D.email = $1
      `,
      values: [email],
    });
    if (drivers.rows.length === 0) {
      return null;
    }

    const driver = new Driver(drivers.rows[0].email);
    driver.user = new User(
      drivers.rows[0].email,
      drivers.rows[0].secret,
      drivers.rows[0].name,
      drivers.rows[0].gender,
      drivers.rows[0].phone,
      drivers.rows[0].profile_photo_url,
      drivers.rows[0].created_on,
      drivers.rows[0].updated_on
    );

    return driver;
  }

  static async findDriverTotalIncome(email) {
    const totalIncome = await makeSingleQuery({
      text: /* sql */ `
        SELECT SUM(B.value) AS total_income
        FROM DriverTrips D JOIN Bids B ON B.tid = D.tid
        WHERE B.status = 'won' AND D.status = 'finished' AND D.email = $1
        `,
      values: [email],
    });
    if (totalIncome.rows.length === 0) {
      return 0;
    }
    return totalIncome.rows[0].total_income;
  }

  static async getDriverIncome(email, month, year) {
    const monthlyIncome = await makeSingleQuery({
      text: /* sql */ `
        SELECT monthly_income 
        FROM (SELECT SUM(B.value) AS monthly_income,
                EXTRACT(MONTH FROM D.departing_on) AS month,
                EXTRACT(YEAR FROM D.departing_on) AS year
              FROM DriverTrips D JOIN Bids B on B.tid = D.tid
              WHERE B.status = 'won' AND D.status = 'finished' AND D.email = $1
              GROUP BY(month,year)) AS monthly_incomes
        WHERE monthly_incomes.month = $2 AND monthly_incomes.year = $3
        `,
      values: [email, month, year],
    });

    if (monthlyIncome.rows.length === 0) {
      return 0;
    }
    return monthlyIncome.rows[0].monthly_income;
  }

  static async getConsecutiveTrips(email, page, limit) {
    const consecutiveTrips = await makeSingleQuery({
      text: /* sql */ `
        WITH DistinctDates(date) AS (
          SELECT DISTINCT CAST(departing_on AS DATE)
          FROM DriverTrips D
          WHERE D.email = $1 AND D.status = 'finished'
        ),
          ConsecutiveDates AS (
            SELECT ROW_NUMBER() OVER (ORDER by date) AS row_number,
              date - ROW_NUMBER() OVER (ORDER by date) * INTERVAL '1 day' AS single_group,date
            FROM DistinctDates
          )
        SELECT MIN(date) AS start_date, MAX(date) AS end_date, COUNT(*) AS num_dates
        FROM ConsecutiveDates
        GROUP BY single_group
        ORDER BY start_date DESC, num_dates DESC
        LIMIT $2
        OFFSET $3
        `,
      values: [email, limit + 1, (page - 1) * limit],
    });
    let hasNextPage;
    if (consecutiveTrips.rows.length === limit + 1) {
      hasNextPage = true;
    } else {
      hasNextPage = false;
    }

    return {
      hasNextPage,
      consecutiveTrips: consecutiveTrips.rows
        .slice(limit)
        .map(consecutiveTrip => {
          consecutiveTrip.start_date,
            consecutiveTrip.end_date,
            consecutiveTrip.num_dates;
        }),
    };
  }

  static async getOverallRating(email) {
    const averageRating = await makeSingleQuery({
      text: /* sql */ `
        SELECT ROUND(AVG(R.score),1) AS rating 
        FROM DriverTrips D JOIN Reviews R ON D.tid = R.tid
        WHERE D.status = 'finished' AND D.email = $1
        `,
      values: [email],
    });

    if (averageRating.rows.length === 0) {
      return 0;
    }

    return averageRating.rows[0].rating;
  }
}

module.exports = { Driver };
