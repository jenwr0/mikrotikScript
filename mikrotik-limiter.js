# ===== MIKROTIK BW DYNAMIC LIMITER ===== #
# need queue trees and firewall mangle

# 35Mbps Base ISP simetric bandwidth
:local base 35000000 
:local subnet "192.168.3.0/24" # I used 192.168.255.0 for guest user (Static bw)
:local prefix "U-"
:local suffix {"-A"; "-B"}

:local activeList [/ip hotspot active find where address in $subnet]
:local activeCount [:len $activeList]

:local todayLimit ($base)
:if ($activeCount >= 1 && $activeCount <= 6) do={
    :set todayLimit ($base / $activeCount)
}


# Convert to Mbps
:local mbps ($todayLimit / 1000000);:local mbpsStr [:pick ($mbps . "") 0 ([:find ($mbps . "") "."] + 3)];


:log info ("Hotspot aktif: $activeCount | Limit per user: $mbpsStr Mbps")

:foreach id in=$activeList do={
    :local ip [/ip hotspot active get $id value-name=address]
    :local qA ("$prefix$ip" . ($suffix->0))
    :local qB ("$prefix$ip" . ($suffix->1))

    :local currentLimitA [/queue tree get [find name=$qA] value-name=max-limit]
    :local currentLimitB [/queue tree get [find name=$qB] value-name=max-limit]

    # Update jika salah satu berbeda dari todayLimit
    :if (($currentLimitA != $todayLimit) || ($currentLimitB != $todayLimit)) do={
        :log info "Update limit untuk $ip: Upload=$currentLimitA, Download=$currentLimitB â†’ $todayLimit"
        /queue tree set [find name=$qA] max-limit=$todayLimit
        /queue tree set [find name=$qB] max-limit=$todayLimit
    }
}
