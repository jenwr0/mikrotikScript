### -----MirotikLimiter
### -- I use custom queue tree and firewall mangle

:local limits { 1=62914560; 2=15728640; 3=10485760; 4=7864320; 5=6291456; 6=5242880 };
:local subnet "192.168.3.0/24";
:local prefix "U-";
:local suffix { "-A"; "-B" };
:local activeCount [:tostr [:len [/ip hotspot active find where address in $subnet]]];
:log info "Hotspot aktif: $activeCount"; 
:local todayLimit ($limits->$activeCount);
:if ($todayLimit = "") do={
    :set todayLimit 5242880; 
};
:foreach id in=[/ip hotspot active find where address in $subnet] do={
    :local ip [/ip hotspot active get $id value-name=address];
    :local qA ("$prefix$ip" . ($suffix->0));
    :local qB ("$prefix$ip" . ($suffix->1));
    :if ([/queue tree get [find name=$qA] max-limit] != $todayLimit) do={
        /queue tree set [find name=$qA] max-limit=$todayLimit;
        /queue tree set [find name=$qB] max-limit=$todayLimit;
    }

}

