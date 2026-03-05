/**
 * Twitter/X 账号订阅列表配置文件
 * 按分类管理，方便增删。修改后重启服务即可生效。
 */

export interface AccountGroup {
    category: string;
    accounts: string[];
}

export const twitterAccounts: AccountGroup[] = [
    {
        category: 'AI & ML',
        accounts: ['ylecun', 'karpathy', 'DrJimFan', 'emollick', 'omarsar0', 'lilianweng', 'swyx', 'simonw', 'chipro', 'hwchase17', 'OfficialLoganK', 'gdb', 'demishassabis', 'drfeifei', '_akhaliq'],
    },
    {
        category: 'Tech & Startups',
        accounts: ['paulg', 'sama', 'garrytan', 'pmarca', 'balajis', 'naval', 'Jason', 'chamath', 'packym', 'benthompson', 'lennysan'],
    },
    {
        category: 'Crypto & Web3',
        accounts: ['VitalikButerin', 'cz_binance', 'cobie', 'RyanSAdams', 'sassal0x', 'lawmaster', 'HsakaTrades', 'DefiIgnas', 'adamscochran'],
    },
    {
        category: 'Geopolitics & Policy',
        accounts: ['ianbremmer', 'WalterIsaacson', 'NateSilver538', 'PeterZeihan', 'Noahpinion'],
    },
    {
        category: 'Developers',
        accounts: ['rauchg', 'kentcdodds', 'ThePrimeagen', 'fireship_dev', 't3dotgg', 'levelsio', 'dan_abramov'],
    },
    {
        category: 'E-commerce',
        accounts: ['web', 'retailgeek', 'juozas', 'rickwatson'],
    },
];

/** 获取所有账号的扁平列表 */
export function getAllAccounts(): string[] {
    return twitterAccounts.flatMap((group) => group.accounts);
}
