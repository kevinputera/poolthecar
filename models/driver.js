const { makeSingleQuery } = require('../db');
const { User } = require('./user');

class Driver extends User {
  constructor(
    email,
    secret,
    name,
    gender,
    phone,
    profilePhotoUrl,
    createdOn,
    updatedOn
  ) {
    super(
      email,
      secret,
      name,
      gender,
      phone,
      profilePhotoUrl,
      createdOn,
      updatedOn
    );
  }

  static async register(email) {
    await makeSingleQuery({
      text: /* sql */ `
        INSERT INTO Drivers (email) 
        VALUES ($1)
      `,
      values: [email],
    });
  }

  static async findByEmail(email) {
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
    const driver = new Driver(
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

  static async findByTid(tid) {
    const drivers = await makeSingleQuery({
      text: /* sql */ `
      SELECT  DCT.driver_email, U.secret, U.name, U.gender, U.phone,
              U.profile_photo_url, U.created_on, U.updated_on
      FROM DriversCarsTrips DCT
      JOIN Users U ON DCT.driver_email = U.email
      WHERE DCT.trip_tid = $1
      `,
      values: [tid],
    });
    if (drivers.rows.length < 1) {
      return null;
    }
    const row = drivers.rows[0];
    return new User(
      row.driver_email,
      row.secret,
      row.name,
      row.gender,
      row.phone,
      row.profile_photo_url,
      row.created_on,
      row.updated_on
    );
  }

  static async getTotalIncome(email) {
    const totalIncome = await makeSingleQuery({
      text: /* sql */ `
        SELECT SUM(B.value) AS total_income
        FROM DriversCarsTrips DCT
        JOIN Bids B ON B.tid = DCT.trip_tid
        WHERE B.status = 'won'
        AND DCT.trip_status = 'finished'
        AND DCT.driver_email = $1
        `,
      values: [email],
    });
    if (totalIncome.rows.length === 0) {
      return 0;
    }
    return totalIncome.rows[0].total_income;
  }

  static async getMonthlyIncome(email, month, year) {
    const monthlyIncome = await makeSingleQuery({
      text: /* sql */ `
        SELECT monthly_income 
        FROM (SELECT SUM(B.value) AS monthly_income,
                EXTRACT(MONTH FROM DCT.trip_departing_on) AS month,
                EXTRACT(YEAR FROM DCT.trip_departing_on) AS year
              FROM DriversCarsTrips DCT
              JOIN Bids B ON B.tid = DCT.trip_tid
              WHERE B.status = 'won'
              AND DCT.trip_status = 'finished'
              AND DCT.driver_email = $1
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
          SELECT DISTINCT CAST(trip_departing_on AS DATE)
          FROM DriversCarsTrips
          WHERE driver_email = $1
          AND trip_status = 'finished'
        ),
        ConsecutiveDates AS (
          SELECT ROW_NUMBER() OVER (ORDER by date) AS row_number,
            date - ROW_NUMBER() OVER (ORDER by date) * INTERVAL '1 day' AS single_group, date
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
        SELECT ROUND(AVG(R.score), 1) AS rating
        FROM DriversCarsTrips DCT
        JOIN Reviews R ON DCT.trip_tid = R.tid
        WHERE DCT.trip_status = 'finished'
        AND DCT.driver_email = $1
      `,
      values: [email],
    });

    if (averageRating.rows.length === 0) {
      return 0;
    }

    return averageRating.rows[0].rating || 0;
  }
}

module.exports = { Driver };
