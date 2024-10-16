class SQLGenerator:
    def __init__(self, date, profession, if_studio_flag, if_active_days_3d):
        self.date = date
        self.profession = profession
        self.if_studio_flag = if_studio_flag
        self.if_active_days_3d = if_active_days_3d

    def generate_sql(self):
        level_condition = "level >= FLOOR(player_level / 5) * 5 - 10"
        rank_condition = "rank >= FLOOR(player_level / 5) - 2"
        
        profession_name = self.profession
        profession_name_mapping = {"突袭者": "突袭", "毁灭者": "毁灭", "防御者": "防御", "守望者":"守望", "粉碎者": "粉碎"}
        profession_alternative_name = profession_name_mapping[profession_name]
        
        if self.if_studio_flag == 'true':
            studio_flag_condition = "studio_flag = '非工作室账号'"
        else:
            studio_flag_condition = "1 = 1"
        
        if self.if_active_days_3d == 'true':
            active_days_3d_condition = "AND active_days_3d > 0"
        else:
            active_days_3d_condition = "AND 1 = 1"
        
        sql = f"""
WITH Unit_PidLevelRankUnitcount AS (
    SELECT
        pid,
        player_level,
        level,
        rank,
        unit_id,
        unit_name
    FROM
        tapdb_one_data.dws_ssrpg_obt_online_unit_metrics_df
    WHERE
        dt = '{self.date}'
        AND {level_condition}
        AND {rank_condition}
        AND pid IN (
            SELECT
                pid
            FROM
                tapdb_one_data.dws_ssrpg_obt_users_metrics_df
            WHERE
                {studio_flag_condition}
                AND dt = '{self.date}'
                {active_days_3d_condition}
        )
    ORDER BY
        pid
),
UnitStatus AS (
    SELECT
        pid,
        player_level,
        level,
        rank,
        COUNT(*) AS unit_count
    FROM
        tapdb_one_data.dws_ssrpg_obt_online_unit_metrics_df
    WHERE
        dt = '{self.date}'
        and unit_id in (
            SELECT
                id
            FROM
                tapdb_one_data.dim_ssrpg_online_role_unit_profession
            WHERE
                profession = '{profession_name}'
        )
    GROUP BY
        pid,
        player_level,
        level,
        rank
),
Unit_PidAwaitingDone AS (
    SELECT
        pid,
        player_level,
        SUM(
            CASE
                WHEN {level_condition}
                AND {rank_condition}
                THEN unit_count
                ELSE 0
            END
        ) AS "awaiting_unit_count",
        SUM(
            CASE
                WHEN level >= FLOOR(player_level / 5) * 5
                AND rank >= FLOOR(player_level / 5) THEN unit_count
                ELSE 0
            END
        ) AS "done_unit_count"
    FROM
        UnitStatus
    GROUP BY
        pid,
        player_level
),
Unit_PidLevelRankUnitcount_DonelevelDonerequired AS (
    SELECT
        uplru.pid,
        uplru.player_level,
        uplru.rank,
        CAST(FLOOR(uplru.player_level / 5) AS INT) AS done_level,
        req.resource_n_req_sum AS done_exp_req_n,
        req.resource_r_req_sum AS done_exp_req_r,
        req.resource_sr_req_sum AS done_exp_req_sr,
        req.resource_ssr_req_sum AS done_exp_req_ssr,
        uplru.unit_id,
        prof.profession,
        upad.awaiting_unit_count,
        upad.done_unit_count
    FROM
        Unit_PidLevelRankUnitcount uplru
        JOIN tapdb_one_data.dim_ssrpg_rank_resource_req_cartesian req ON uplru.rank = req.start_rank
        AND CAST(FLOOR(player_level / 5) AS INT) = req.end_rank
        JOIN tapdb_one_data.dim_ssrpg_online_role_unit_profession prof ON uplru.unit_id = prof.id
        JOIN Unit_PidAwaitingDone upad ON uplru.pid = upad.pid
    WHERE
        prof.profession = '{profession_name}'
),
uplru_grouped_pid AS (
    SELECT
        pid,
        player_level,
        awaiting_unit_count,
        done_unit_count,
        SUM(done_exp_req_n) AS done_exp_req_n_avg,
        SUM(done_exp_req_r) AS done_exp_req_r_avg,
        SUM(done_exp_req_sr) AS done_exp_req_sr_avg,
        SUM(done_exp_req_ssr) AS done_exp_req_ssr_avg,
        COUNT(*) AS unit_count_dark
    FROM
        Unit_PidLevelRankUnitcount_DonelevelDonerequired
    GROUP BY
        pid,
        player_level,
        awaiting_unit_count,
        done_unit_count
),
UnitStorage AS (
    SELECT
        pid,
        SUM(
            CASE
                WHEN rarity = 1 THEN count
                ELSE 0
            END
        ) AS resource_storage_n,
        SUM(
            CASE
                WHEN rarity = 2 THEN count
                ELSE 0
            END
        ) AS resource_storage_r,
        SUM(
            CASE
                WHEN rarity = 3 THEN count
                ELSE 0
            END
        ) AS resource_storage_sr,
        SUM(
            CASE
                WHEN rarity = 4 THEN count
                ELSE 0
            END
        ) AS resource_storage_ssr
    FROM
        (
            SELECT
                tm.pid,
                tm.param0,
                tm.count,
                mat.name,
                mat.rarity
            FROM
                tapdb_one_data.dws_ssrpg_obt_online_treasure_metrics_di tm
                JOIN tapdb_one_data.dim_ssrpg_online_unit_rank_material mat ON tm.param0 = mat.id
            WHERE
                dt = '{self.date}'
                and tm.treasure_type_name LIKE '%进阶%'
                and mat.name LIKE '%{profession_alternative_name}%'
        )
    GROUP BY
        pid
),
FinalCal AS (
    SELECT
        uplru_grouped_pid.pid,
        uplru_grouped_pid.player_level,
        uplru_grouped_pid.awaiting_unit_count,
        uplru_grouped_pid.done_unit_count,
        uplru_grouped_pid.done_exp_req_n_avg,
        uplru_grouped_pid.done_exp_req_r_avg,
        uplru_grouped_pid.done_exp_req_sr_avg,
        uplru_grouped_pid.done_exp_req_ssr_avg,
        uplru_grouped_pid.unit_count_dark,
        us.resource_storage_n,
        us.resource_storage_r,
        us.resource_storage_sr,
        us.resource_storage_ssr
    FROM
        uplru_grouped_pid
        JOIN UnitStorage us ON uplru_grouped_pid.pid = us.pid
    ORDER BY
        uplru_grouped_pid.pid
)
SELECT
    CASE
        WHEN player_level BETWEEN 3 AND 4 THEN '3-4'
        WHEN player_level BETWEEN 5 AND 9 THEN '5-9'
        WHEN player_level BETWEEN 10 AND 14 THEN '10-14'
        WHEN player_level BETWEEN 15 AND 19 THEN '15-19'
        WHEN player_level BETWEEN 20 AND 24 THEN '20-24'
        WHEN player_level BETWEEN 25 AND 29 THEN '25-29'
        WHEN player_level BETWEEN 30 AND 34 THEN '30-34'
        WHEN player_level BETWEEN 35 AND 39 THEN '35-39'
        WHEN player_level BETWEEN 40 AND 44 THEN '40-44'
        WHEN player_level BETWEEN 45 AND 49 THEN '45-49'
        WHEN player_level BETWEEN 50 AND 54 THEN '50-54'
        WHEN player_level BETWEEN 55 AND 59 THEN '55-59'
        WHEN player_level = 60 THEN '60'
    END AS 等级段,
    COUNT(*) AS 等级段人数,
    AVG(awaiting_unit_count) AS 养的角色数,
    AVG(done_unit_count) AS 养满角色数,
    AVG(unit_count_dark) AS 待养角色数,
    AVG(done_exp_req_n_avg) AS N级资源需求,
    AVG(done_exp_req_r_avg) AS R级资源需求,
    AVG(done_exp_req_sr_avg) AS SR级资源需求,
    AVG(done_exp_req_ssr_avg) AS SSR级资源需求,
    AVG(resource_storage_n) AS N级资源库存,
    AVG(resource_storage_r) AS R级资源库存,
    AVG(resource_storage_sr) AS SR级资源库存,
    AVG(resource_storage_ssr) AS SSR级资源库存,
    AVG(resource_storage_n) - AVG(done_exp_req_n_avg) AS N级资源缺口,
    AVG(resource_storage_r) - AVG(done_exp_req_r_avg) AS R级资源缺口,
    AVG(resource_storage_sr) - AVG(done_exp_req_sr_avg) AS SR级资源缺口,
    AVG(resource_storage_ssr) - AVG(done_exp_req_ssr_avg) AS SSR级资源缺口
FROM FinalCal
GROUP BY
    等级段
ORDER BY
    等级段;
        """
        # Rest of the SQL statement goes here
        return sql

# # Usage example
# generator = SQLGenerator(date='2024-02-04', profession="突袭者")
# sql_statement = generator.generate_sql()

# with open("output.sql", "w", encoding='utf-8') as file:
#     file.write(sql_statement)
